<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    /**
     * Menampilkan daftar data pengguna (murid & guru) dengan statistik.
     * Sequence Diagram: 1. BukaHalaman("DataPengguna") → 1.1 GetDataPengguna()
     */
    public function index(Request $request)
    {
        $query = User::query()->where('role', '!=', 'admin');

        // Filter berdasarkan tab/role
        if ($request->filled('role') && in_array($request->role, ['student', 'tutor'])) {
            $query->where('role', $request->role);
        }

        // Filter berdasarkan status akun
        if ($request->filled('status')) {
            $query->where('status_akun', $request->status);
        }

        // Pencarian berdasarkan nama, email, nip
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['name', 'email', 'role', 'created_at', 'status_akun'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage)->withQueryString();

        // Statistik ringkasan
        $totalPengguna = User::where('role', '!=', 'admin')->count();
        $totalMurid = User::where('role', 'student')->count();
        $totalGuru = User::where('role', 'tutor')->count();
        $akunBaru = User::where('role', '!=', 'admin')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return Inertia::render('Admin/DataPengguna/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'status', 'search', 'sort_by', 'sort_dir', 'per_page']),
            'stats' => [
                'totalPengguna' => $totalPengguna,
                'totalMurid' => $totalMurid,
                'totalGuru' => $totalGuru,
                'akunBaru' => $akunBaru,
            ],
        ]);
    }

    /**
     * Menyimpan data guru baru (Tambah Akun).
     * Sequence Diagram:
     *   2. KlikButton("TambahAkun")
     *   3. InputDataPengguna()
     *   4. KlikButton("Simpan") → 4.1 KirimDataAkunBaru()
     *     → 4.1.1 SimpanDataAkun() → 4.1.2 ReturnStatus(simpan)
     *   4.2 DisplayAkunBerhasilDitambahkan()
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'no_hp' => 'nullable|string|max:20',
            'nip' => 'nullable|string|max:50',
        ]);

        $defaultPassword = User::generateDefaultPassword($validated['name']);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($defaultPassword),
            'role' => 'tutor', // Hanya guru yang bisa ditambahkan
            'no_hp' => $validated['no_hp'] ?? null,
            'nip' => $validated['nip'] ?? null,
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
        ]);

        return redirect()->route('admin.data-pengguna.index')->with('success', "Akun guru \"{$user->name}\" berhasil ditambahkan. Password default: {$defaultPassword}");
    }

    /**
     * Mengambil detail satu pengguna (Lihat Detail).
     * Sequence Diagram:
     *   9. KlikButton("Detail") → 9.1 GetDataPengguna()
     *     → 9.1.1 GetDetailDataUser() → 9.1.2 ReturnDataDetailUser()
     *   9.2 DisplayDetailPengguna()
     */
    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => $user->makeVisible([]),
        ]);
    }

    /**
     * Memperbarui data pengguna (Edit Data).
     * Sequence Diagram:
     *   5. KlikButton("Edit")
     *   6. KlikButton("Simpan") → 6.1 KirimDataPerubahan()
     *     → 6.1.1 UpdateDataUser() → 6.1.2 ReturnStatus(update)
     *   6.2 DisplayInfoDataBerhasilDiperbarui()
     */
    public function update(Request $request, User $user)
    {
        abort_if($user->isAdmin(), 403, 'Akun admin tidak dapat diubah dari halaman ini.');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'no_hp' => 'nullable|string|max:20',
            'nip' => 'nullable|string|max:50',
            'role' => ['required', Rule::in(['student', 'tutor'])],
            'status_akun' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $user->update($validated);

        return redirect()->route('admin.data-pengguna.index')->with('success', "Data pengguna \"{$user->name}\" berhasil diperbarui.");
    }

    /**
     * Menghapus data pengguna (Hapus Data).
     * Sequence Diagram:
     *   7. KlikButton("Hapus")
     *   8. KlikButton("YaHapus") → 8.1 KirimPermintaanHapus()
     *     → 8.1.1 DeleteDataUser() → 8.1.2 ReturnStatus(hapus)
     *   8.2 DisplayInfoAkunBerhasilDihapus()
     */
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
}
