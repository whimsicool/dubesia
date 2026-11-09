<?php

namespace App\Http\Controllers;

use App\Mail\AkunTutorMail;
use App\Models\Pendaftaran;
use App\Models\Schedule;
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
        $users = $this->filteredUsersQuery($request)
            ->with(['pendaftaran' => fn ($query) => $query->select('id', 'user_id', 'program', 'jenis_kelas')])
            ->paginate($request->input('per_page', 10))
            ->withQueryString()
            ->through(fn (User $user): array => [
                ...$user->makeHidden('pendaftaran')->toArray(),
                'program_label' => Pendaftaran::labelProgram($user->pendaftaran?->program),
                'jenis_kelas_label' => Pendaftaran::labelJenisKelas($user->pendaftaran?->jenis_kelas),
            ]);

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
                ]);

                // email_verified_at tidak ada di daftar fillable, jadi nilainya
                // hilang bila dikirim lewat create(). Tandai lewat method model
                // agar akun baru bisa meminta kata sandi dari /forgot-password.
                $user->markEmailAsVerified();

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

    /**
     * Memperbarui nama dan nomor HP akun murid atau tutor. Email, peran,
     * status, dan kata sandi tidak diubah lewat jalur ini.
     */
    public function update(Request $request, User $user)
    {
        abort_if($user->isAdmin(), 403, 'Akun admin tidak dapat diubah dari halaman ini.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'no_hp' => ['nullable', 'string', 'max:20'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'no_hp' => $this->normalizePhoneNumber($validated['no_hp'] ?? null),
        ]);

        return redirect()->route('admin.data-pengguna.index')
            ->with('success', "Data akun \"{$user->name}\" berhasil diperbarui.");
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
     *
     * Satu akun yang masih memiliki penugasan atau riwayat membatalkan seluruh
     * operasi. Hapus massal tidak menawarkan hapus paksa, jadi admin harus
     * melepas penugasan lebih dulu lewat hapus satuan.
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

        $blocked = $users
            ->map(fn (User $user): array => [
                'user' => $user,
                'dependencies' => $this->deletionDependencies($user),
            ])
            ->filter(fn (array $item): bool => $this->hasDeletionDependencies($item['dependencies']));

        if ($blocked->isNotEmpty()) {
            $accounts = $blocked
                ->map(fn (array $item): string => sprintf(
                    '%s (%s)',
                    $item['user']->name,
                    $this->dependencySummary($item['dependencies']),
                ))
                ->implode(', ');

            return redirect()->route('admin.data-pengguna.index')->with(
                'error',
                "Tidak ada akun yang dihapus. Akun berikut masih memiliki penugasan atau riwayat: {$accounts}. Lepas penugasan tutor atau tangani riwayatnya lebih dulu.",
            );
        }

        DB::transaction(function () use ($users) {
            $users->each(fn (User $user) => $user->delete());
        });

        return redirect()->route('admin.data-pengguna.index')
            ->with('success', $users->count().' akun berhasil dihapus.');
    }

    /**
     * Menghapus satu akun. Penugasan tutor dilepas hanya setelah admin
     * mengonfirmasi hapus paksa; presensi, keanggotaan kelas, dan nilai tidak
     * pernah dihapus dari halaman ini.
     */
    public function destroy(Request $request, User $user)
    {
        // Jangan izinkan menghapus akun admin
        if ($user->isAdmin()) {
            return redirect()->route('admin.data-pengguna.index')->with('error', 'Tidak dapat menghapus akun admin.');
        }

        $dependencies = $this->deletionDependencies($user);

        if ($this->hasProtectedHistory($dependencies)) {
            return redirect()->route('admin.data-pengguna.index')->with('error', $this->protectedHistoryWarning($user, $dependencies));
        }

        if ($dependencies['classes'] !== [] || $dependencies['schedules'] !== []) {
            if (! $request->boolean('force')) {
                return redirect()->route('admin.data-pengguna.index')
                    ->with('error', $this->assignmentWarning($user, $dependencies))
                    ->with('force_delete', true);
            }

            DB::transaction(function () use ($user): void {
                DB::table('class_tutor')->where('tutor_id', $user->id)->delete();
                // Jadwal tetap ada agar admin dapat menugaskan tutor lain.
                DB::table('schedules')->where('tutor_id', $user->id)->update(['tutor_id' => null]);
                $user->delete();
            });

            return redirect()->route('admin.data-pengguna.index')->with('success', sprintf(
                'Akun "%s" dihapus. %s.',
                $user->name,
                implode(' dan ', array_filter([
                    $dependencies['classes'] === [] ? null : count($dependencies['classes']).' penugasan kelas dilepas',
                    $dependencies['schedules'] === [] ? null : count($dependencies['schedules']).' jadwal dikosongkan untuk ditugaskan ulang',
                ])),
            ));
        }

        $name = $user->name;
        $user->delete();

        return redirect()->route('admin.data-pengguna.index')->with('success', "Akun \"{$name}\" berhasil dihapus.");
    }

    /**
     * Dependensi akun yang membatasi penghapusan.
     *
     * @return array{
     *     classes: list<string>,
     *     schedules: list<string>,
     *     attendance: int,
     *     enrollments: int,
     *     grades: int
     * }
     */
    private function deletionDependencies(User $user): array
    {
        $classes = $user->teachingClasses()
            ->orderBy('classes.name')
            ->pluck('classes.name')
            ->all();

        $schedules = Schedule::query()
            ->where('tutor_id', $user->id)
            ->with('room')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(function (Schedule $schedule): string {
                $day = config('dubesia.days')[$schedule->day_of_week] ?? 'Hari tidak diketahui';
                $room = $schedule->room?->name ?? 'ruang belum ditentukan';

                return sprintf(
                    '%s %s–%s (%s)',
                    $day,
                    substr((string) $schedule->start_time, 0, 5),
                    substr((string) $schedule->end_time, 0, 5),
                    $room,
                );
            })
            ->all();

        return [
            'classes' => $classes,
            'schedules' => $schedules,
            'attendance' => $user->isTutor()
                ? $user->classAttendancesAsTutor()->count()
                : $user->classAttendancesAsStudent()->count(),
            'enrollments' => $user->enrolledClasses()->count(),
            'grades' => $user->grades()->count(),
        ];
    }

    /**
     * @param  array{classes: list<string>, schedules: list<string>, attendance: int, enrollments: int, grades: int}  $dependencies
     */
    private function hasDeletionDependencies(array $dependencies): bool
    {
        return $dependencies['classes'] !== []
            || $dependencies['schedules'] !== []
            || $this->hasProtectedHistory($dependencies);
    }

    /**
     * Riwayat yang tidak boleh dihapus atau dilepas dari halaman ini.
     *
     * @param  array{classes: list<string>, schedules: list<string>, attendance: int, enrollments: int, grades: int}  $dependencies
     */
    private function hasProtectedHistory(array $dependencies): bool
    {
        return $dependencies['attendance'] > 0
            || $dependencies['enrollments'] > 0
            || $dependencies['grades'] > 0;
    }

    /**
     * @param  array{classes: list<string>, schedules: list<string>, attendance: int, enrollments: int, grades: int}  $dependencies
     */
    private function dependencySummary(array $dependencies): string
    {
        return implode(', ', array_filter([
            $dependencies['classes'] === [] ? null : count($dependencies['classes']).' kelas',
            $dependencies['schedules'] === [] ? null : count($dependencies['schedules']).' jadwal',
            $dependencies['attendance'] === 0 ? null : $dependencies['attendance'].' catatan presensi',
            $dependencies['enrollments'] === 0 ? null : $dependencies['enrollments'].' keanggotaan kelas',
            $dependencies['grades'] === 0 ? null : $dependencies['grades'].' nilai',
        ]));
    }

    /**
     * @param  array{classes: list<string>, schedules: list<string>, attendance: int, enrollments: int, grades: int}  $dependencies
     */
    private function assignmentWarning(User $user, array $dependencies): string
    {
        $assignments = array_filter([
            $dependencies['classes'] === [] ? null : 'kelas '.implode(', ', $dependencies['classes']),
            $dependencies['schedules'] === [] ? null : 'jadwal '.implode(', ', $dependencies['schedules']),
        ]);

        return sprintf(
            'Akun "%s" masih terhubung dengan %s. Konfirmasi hapus paksa untuk melepas penugasan kelas dan mengosongkan tutor pada jadwal, lalu menghapus akun.',
            $user->name,
            implode(' dan ', $assignments),
        );
    }

    /**
     * @param  array{classes: list<string>, schedules: list<string>, attendance: int, enrollments: int, grades: int}  $dependencies
     */
    private function protectedHistoryWarning(User $user, array $dependencies): string
    {
        return sprintf(
            'Akun "%s" tidak dapat dihapus karena masih memiliki %s. Presensi, keanggotaan kelas, dan nilai adalah riwayat yang tidak dihapus otomatis dari halaman ini. Tangani data tersebut lebih dulu.',
            $user->name,
            $this->dependencySummary($dependencies),
        );
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
