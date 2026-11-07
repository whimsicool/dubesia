<?php

namespace App\Http\Controllers;

use App\Mail\AkunTutorMail;
use App\Models\Pendaftaran;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Throwable;

class AdminUserController extends Controller
{
    /**
     * Menampilkan daftar data pengguna (murid & tutor) dengan statistik.
     * Sequence Diagram: 1. BukaHalaman("DataPengguna") → 1.1 GetDataPengguna()
     */
    public function index(Request $request)
    {
        $users = $this->filteredUsersQuery($request)->paginate($request->input('per_page', 10))->withQueryString();

        // Statistik ringkasan
        $totalPengguna = $this->visibleUsersQuery()->count();
        $totalMurid = $this->visibleUsersQuery()->where('role', 'student')->count();
        $totalTutor = $this->visibleUsersQuery()->where('role', 'tutor')->count();
        $akunBaru = $this->visibleUsersQuery()
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return Inertia::render('Admin/DataPengguna/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'status', 'search', 'sort_by', 'sort_dir', 'per_page']),
            'stats' => [
                'totalPengguna' => $totalPengguna,
                'totalMurid' => $totalMurid,
                'totalTutor' => $totalTutor,
                'akunBaru' => $akunBaru,
            ],
        ]);
    }

    /**
     * Menyimpan data tutor baru (Tambah Akun).
     * Kata sandi dibuat sistem dan dikirim ke email tutor.
     */
    public function store(Request $request)
    {
        $request->merge(['email' => mb_strtolower(trim((string) $request->email))]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'no_hp' => 'nullable|string|max:20',
        ]);

        $validated['no_hp'] = $this->normalizePhoneNumber($validated['no_hp'] ?? null);

        $defaultPassword = User::generateDefaultPassword($validated['name']);

        try {
            $user = DB::transaction(function () use ($validated, $defaultPassword): User {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => $defaultPassword,
                    'role' => User::ROLE_TUTOR,
                    'no_hp' => $validated['no_hp'] ?? null,
                    'status_akun' => 'aktif',
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);

                Mail::to($user->email)->send(new AkunTutorMail($user, $defaultPassword));

                return $user;
            });
        } catch (Throwable $e) {
            report($e);

            return back()->with('error', 'Akun tutor gagal dibuat karena email kredensial tidak terkirim. Periksa konfigurasi email lalu coba lagi.');
        }

        return redirect()->route('admin.data-pengguna.index')
            ->with('success', "Akun tutor \"{$user->name}\" berhasil dibuat. Kredensial telah dikirim ke {$user->email}.");
    }

    /**
     * Mengambil detail satu pengguna (Lihat Detail).
     */
    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => $user->makeVisible([]),
        ]);
    }

    /**
     * Mengubah status akun. Admin tidak boleh mengubah identitas atau peran
     * pengguna; hanya status aktif/nonaktif yang dapat diubah dari halaman ini.
     */
    public function updateStatus(Request $request, User $user)
    {
        abort_if($user->isAdmin(), 403, 'Akun admin tidak dapat diubah dari halaman ini.');

        $validated = $request->validate([
            'status_akun' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $aktif = $validated['status_akun'] === 'aktif';

        $user->update([
            'status_akun' => $validated['status_akun'],
            // is_active dipakai login dan middleware; keduanya harus sejalan.
            'is_active' => $aktif,
        ]);

        return redirect()->route('admin.data-pengguna.index')->with(
            'success',
            $aktif
                ? "Akun \"{$user->name}\" diaktifkan kembali."
                : "Akun \"{$user->name}\" dinonaktifkan. Datanya tetap tersimpan sebagai arsip.",
        );
    }

    private function normalizePhoneNumber(?string $phone): ?string
    {
        if ($phone === null || trim($phone) === '') {
            return null;
        }

        $digits = preg_replace('/\\D+/', '', $phone);
        $digits = preg_replace('/^62/', '', $digits);

        return $digits === '' ? null : '+62'.$digits;
    }

    /**
     * Menghapus data pengguna secara massal (Hapus Data).
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:users,id'],
        ]);

        $selectedIds = collect($validated['ids'])->map(fn ($id) => (int) $id)->unique();
        $users = $this->visibleUsersQuery()->whereIn('id', $selectedIds)->get();

        // Pastikan seluruh akun terpilih memang termasuk data yang boleh dikelola admin.
        if ($users->count() !== $selectedIds->count()) {
            return back()->with('error', 'Sebagian akun tidak dapat dihapus. Muat ulang halaman lalu pilih akun yang tersedia.');
        }

        DB::transaction(function () use ($users) {
            $users->each(fn (User $user) => $user->delete());
        });

        return redirect()->route('admin.data-pengguna.index')
            ->with('success', $users->count().' akun berhasil dihapus.');
    }

    public function destroy(User $user)
    {
        // Jangan izinkan menghapus akun admin
        if ($user->isAdmin()) {
            return redirect()->route('admin.data-pengguna.index')->with('error', 'Tidak dapat menghapus akun admin.');
        }

        $name = $user->name;
        $user->delete();

        return redirect()->route('admin.data-pengguna.index')->with('success', "Akun \"{$name}\" berhasil dihapus.");
    }

    /** Unduh data pengguna sebagai PDF, mengikuti filter yang sedang aktif. */
    public function export(Request $request)
    {
        $rows = $this->filteredUsersQuery($request)->get()->map(fn (User $user): array => [
            'name' => $user->name,
            'email' => $user->email,
            'no_hp' => $user->no_hp,
            'role' => match ($user->role) {
                User::ROLE_STUDENT => 'Murid',
                User::ROLE_TUTOR => 'Tutor',
                default => ucfirst($user->role),
            },
            'status_akun' => $user->status_akun,
            'created_at' => $user->created_at,
        ]);

        return Pdf::loadView('pdf.data-pengguna', [
            'rows' => $rows,
            'filters' => $request->only(['role', 'status', 'search']),
            'generatedAt' => now(),
        ])
            ->setPaper('a4', 'landscape')
            ->download('data-pengguna-'.now()->format('Y-m-d_H-i-s').'.pdf');
    }

    /** Murid menunggu atau ditolak tidak ditampilkan sebagai data murid aktif. */
    private function visibleUsersQuery(): Builder
    {
        return User::query()
            ->where('role', '!=', User::ROLE_ADMIN)
            ->where(function (Builder $query) {
                $query->whereDoesntHave('pendaftaran')
                    ->orWhereHas('pendaftaran', fn (Builder $registration) => $registration->where('status', Pendaftaran::STATUS_TERVERIFIKASI));
            });
    }

    /** Daftar pengguna dengan filter, pencarian, dan urutan yang sama untuk halaman dan PDF. */
    private function filteredUsersQuery(Request $request): Builder
    {
        $query = $this->visibleUsersQuery();

        if ($request->filled('role') && in_array($request->role, ['student', 'tutor'], true)) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status_akun', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['name', 'email', 'role', 'created_at', 'status_akun'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return $query;
    }
}
