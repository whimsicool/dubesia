import AdminLayout from '@/Layouts/AdminLayout';
import PageBreadcrumbs from '@/Components/Admin/PageBreadcrumbs';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════
   HALAMAN KELOLA DATA PENGGUNA (ADMIN)
   Sesuai desain mockup DUBESIA Portal Akademik
   ═══════════════════════════════════════════════ */

export default function Index({ users, filters, stats }) {
    const flash = usePage().props.flash || {};

    // ── State ──
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [perPage, setPerPage] = useState(filters.per_page || 6);
    const [selectedRows, setSelectedRows] = useState([]);
    const searchTimeout = useRef(null);

    // ── Drawer ──
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // ── Detail modal ──
    const [detailUser, setDetailUser] = useState(null);

    // ── Delete confirmation ──
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // ── Flash message ──
    const [flashMsg, setFlashMsg] = useState(flash.success || flash.error || '');
    const flashType = flash.success ? 'success' : flash.error ? 'error' : '';

    useEffect(() => {
        if (flashMsg) {
            const t = setTimeout(() => setFlashMsg(''), 5000);
            return () => clearTimeout(t);
        }
    }, [flashMsg]);

    // ── Inertia form ──
    const form = useForm({
        name: '',
        email: '',
        no_hp: '',
        nip: '',
        role: 'tutor',
        status_akun: 'aktif',
    });

    // ── Helpers ──
    const applyFilters = (overrides = {}) => {
        const params = {
            search, role: activeTab, status: statusFilter, per_page: perPage,
            ...overrides,
        };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(route('admin.data-pengguna.index'), params, {
            preserveState: true, preserveScroll: true,
        });
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => applyFilters({ search: val }), 400);
    };

    const handleTabChange = (role) => {
        setActiveTab(role);
        applyFilters({ role });
    };

    const handleStatusChange = (e) => {
        const val = e.target.value;
        setStatusFilter(val);
        applyFilters({ status: val });
    };

    const handlePerPageChange = (e) => {
        const val = parseInt(e.target.value);
        setPerPage(val);
        applyFilters({ per_page: val });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setActiveTab('');
        setPerPage(6);
        router.get(route('admin.data-pengguna.index'), {}, { preserveState: true, preserveScroll: true });
    };

    // ── Drawer ──
    const openCreateDrawer = () => {
        setEditingUser(null);
        form.reset();
        form.setData({ name: '', email: '', no_hp: '', nip: '', role: 'tutor', status_akun: 'aktif' });
        form.clearErrors();
        setDrawerOpen(true);
    };

    const openEditDrawer = (user) => {
        setEditingUser(user);
        form.setData({
            name: user.name || '', email: user.email || '',
            no_hp: user.no_hp || '', nip: user.nip || '',
            role: user.role || 'student', status_akun: user.status_akun || 'aktif',
        });
        form.clearErrors();
        setDrawerOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            form.put(route('admin.data-pengguna.update', editingUser.id), {
                onSuccess: () => { setDrawerOpen(false); setEditingUser(null); },
            });
        } else {
            form.post(route('admin.data-pengguna.store'), {
                onSuccess: () => { setDrawerOpen(false); },
            });
        }
    };

    // ── Delete ──
    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.data-pengguna.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const handleBulkDelete = () => {
        if (selectedRows.length === 0) return;
        setBulkDeleting(true);
        router.post(route('admin.data-pengguna.bulk-destroy'), { ids: selectedRows }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setSelectedRows([]);
                setBulkDeleteOpen(false);
                setFlashMsg(page.props.flash?.success || page.props.flash?.error || '');
            },
            onFinish: () => setBulkDeleting(false),
        });
    };

    // ── Checkbox ──
    const toggleRow = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };
    const toggleAllRows = () => {
        if (!users.data) return;
        const visibleIds = users.data.map((user) => user.id);
        const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRows.includes(id));
        setSelectedRows((current) => allVisibleSelected
            ? current.filter((id) => !visibleIds.includes(id))
            : [...new Set([...current, ...visibleIds])]);
    };

    // ── Initials helper ──
    const getInitials = (name) => {
        return (name || '').split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
    };

    // ── Tab counts ──
    const tabCounts = {
        '': stats.totalPengguna,
        'student': stats.totalMurid,
        'tutor': stats.totalGuru,
    };

    // ── Role labels ──
    const roleLabel = (role) => {
        if (role === 'tutor') return 'Tutor';
        if (role === 'admin') return 'Admin';
        return 'Murid';
    };

    return (
        <AdminLayout>
            <Head title="Kelola Data Pengguna" />

            {/* Flash Message */}
            {flashMsg && (
                <div className={`kdp-flash kdp-flash--${flashType}`}>
                    <span>{flashMsg}</span>
                    <button onClick={() => setFlashMsg('')} className="kdp-flash__close">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* ── Page Header ── */}
            <div className="kdp-header">
                <div>
                    <PageBreadcrumbs
                        className="mb-2"
                        items={[
                            { label: 'Dashboard Admin', route: 'admin.dashboard' },
                            { label: 'Data Murid & Tutor', current: true, route: 'admin.data-pengguna.index' },
                        ]}
                    />
                    <h1 className="kdp-header__title">Kelola Data Pengguna (Murid & Tutor)</h1>
                    <p className="kdp-header__desc">
                        Kelola basis data akun, penerbitan kredensial akses, hak peran pengajar dan siswa di portal akademik DUBESIA.
                    </p>
                </div>
                <div className="kdp-header__actions">
                    <button type="button" className="btn-export">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Ekspor Data (.xlsx)
                    </button>
                    <button type="button" onClick={openCreateDrawer} className="btn-primary-dark">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Akun Tutor
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="kdp-stats">
                <div className="kdp-stat-card">
                    <div className="kdp-stat-card__top">
                        <span className="kdp-stat-card__label">Total Pengguna</span>
                        <div className="kdp-stat-card__icon kdp-stat-card__icon--blue">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <p className="kdp-stat-card__value">{stats.totalPengguna}</p>
                    </div>
                </div>

                <div className="kdp-stat-card">
                    <div className="kdp-stat-card__top">
                        <span className="kdp-stat-card__label">Murid / Siswa</span>
                        <div className="kdp-stat-card__icon kdp-stat-card__icon--blue">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <p className="kdp-stat-card__value">{stats.totalMurid}</p>
                    </div>
                </div>

                <div className="kdp-stat-card">
                    <div className="kdp-stat-card__top">
                        <span className="kdp-stat-card__label">Tutor & Mentor</span>
                        <div className="kdp-stat-card__icon kdp-stat-card__icon--amber">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <p className="kdp-stat-card__value">{stats.totalGuru}</p>
                    </div>
                </div>

                <div className="kdp-stat-card">
                    <div className="kdp-stat-card__top">
                        <span className="kdp-stat-card__label">Akun Baru (7 Hari)</span>
                        <div className="kdp-stat-card__icon kdp-stat-card__icon--violet">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <p className="kdp-stat-card__value">{stats.akunBaru}</p>
                    </div>
                </div>
            </div>

            {/* ── Table Container ── */}
            <div className="kdp-table-container">
                {/* Tabs Row */}
                <div className="kdp-tabs-bar">
                    <div className="kdp-tabs">
                        {[
                            { key: '', label: 'Semua Pengguna' },
                            { key: 'student', label: 'Data Murid' },
                            { key: 'tutor', label: 'Data Tutor' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`kdp-tab ${activeTab === tab.key ? 'kdp-tab--active' : ''}`}
                            >
                                {tab.label} ({tabCounts[tab.key]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="kdp-filters">
                    <span className="kdp-filter-label">Tampilkan:</span>
                    <select value={perPage} onChange={handlePerPageChange} className="kdp-filter-select">
                        <option value={6}>6 Baris</option>
                        <option value={10}>10 Baris</option>
                        <option value={25}>25 Baris</option>
                        <option value={50}>50 Baris</option>
                    </select>

                    <div className="kdp-search-wrap">
                        <svg className="kdp-search-icon h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Cari nama, email, NIP..."
                            className="kdp-search-input"
                        />
                    </div>

                    <select value={statusFilter} onChange={handleStatusChange} className="kdp-filter-select">
                        <option value="">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                    </select>

                    <select className="kdp-filter-select">
                        <option value="">Semua Cohort</option>
                    </select>

                    <button type="button" onClick={clearFilters} className="kdp-filter-clear" title="Reset Filter">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {selectedRows.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#fff7f7' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{selectedRows.length} akun dipilih</span>
                        <button type="button" onClick={() => setBulkDeleteOpen(true)} className="btn-cancel" style={{ color: '#b91c1c', borderColor: '#fecaca' }}>
                            Hapus yang dipilih
                        </button>
                    </div>
                )}

                {/* Data Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="kdp-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        className="kdp-checkbox"
                                        checked={Boolean(users.data?.length) && users.data.every((user) => selectedRows.includes(user.id))}
                                        onChange={toggleAllRows}
                                    />
                                </th>
                                <th>Pengguna</th>
                                <th>Peran / Role</th>
                                <th>Kontak & Email</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data && users.data.length > 0 ? (
                                users.data.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="kdp-checkbox"
                                                checked={selectedRows.includes(u.id)}
                                                onChange={() => toggleRow(u.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="kdp-user-cell">
                                                {u.avatar_url ? (
                                                    <img
                                                        src={u.avatar_url}
                                                        alt={`Foto profil ${u.name}`}
                                                        className="kdp-avatar"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className={`kdp-avatar kdp-avatar--${u.role}`}>
                                                        {getInitials(u.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="kdp-user-name">{u.name}</p>
                                                    {u.nip && (
                                                        <p className="kdp-user-nip">
                                                             {u.role === 'tutor' ? 'NIP' : 'NISN'}: {u.nip}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`kdp-role-badge kdp-role-badge--${u.role}`}>
                                                {u.role === 'tutor' ? (
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                                    </svg>
                                                )}
                                                {roleLabel(u.role)}
                                            </span>
                                            {u.role === 'student' && u.class_level && (
                                                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                                                    Level {u.class_level}
                                                </p>
                                            )}
                                        </td>
                                        <td>
                                            <p className="kdp-contact-email">{u.email}</p>
                                            {u.no_hp && <p className="kdp-contact-phone">{u.no_hp}</p>}
                                        </td>
                                        <td>
                                            <span className={`kdp-status kdp-status--${u.status_akun || 'aktif'}`}>
                                                <span className={`kdp-status-dot kdp-status-dot--${u.status_akun || 'aktif'}`}></span>
                                                {u.status_akun === 'nonaktif' ? 'Nonaktif' : 'Aktif'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailUser(u)}
                                                    title="Detail"
                                                    style={{
                                                        padding: '6px', borderRadius: '8px', border: 'none',
                                                        background: 'none', color: '#94a3b8', cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditDrawer(u)}
                                                    title="Edit"
                                                    style={{
                                                        padding: '6px', borderRadius: '8px', border: 'none',
                                                        background: 'none', color: '#94a3b8', cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(u)}
                                                    title="Hapus"
                                                    style={{
                                                        padding: '6px', borderRadius: '8px', border: 'none',
                                                        background: 'none', color: '#94a3b8', cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">
                                        <div className="kdp-empty">
                                            <svg className="kdp-empty__icon h-10 w-10" style={{ margin: '0 auto 12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="kdp-empty__title">Tidak ada data pengguna ditemukan</p>
                                            <p className="kdp-empty__desc">Coba ubah filter pencarian Anda</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="kdp-pagination">
                        <span className="kdp-pagination__info">
                            Menampilkan {users.from}–{users.to} dari {users.total} data pengguna
                        </span>
                        <div className="kdp-pagination__links">
                            {users.links && users.links.map((link, i) => {
                                if (link.url === null) {
                                    return (
                                        <span
                                            key={i}
                                            className="kdp-pagination__link kdp-pagination__link--disabled"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveState
                                        preserveScroll
                                        className={`kdp-pagination__link ${link.active ? 'kdp-pagination__link--active' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════ DRAWER: Formulir Generate Akun ═══════ */}
            {drawerOpen && (
                <>
                    <div className={editingUser ? 'kdp-drawer-overlay' : 'kdp-modal-overlay'} onClick={() => setDrawerOpen(false)} />
                    <div className={editingUser ? 'kdp-drawer' : 'kdp-modal kdp-modal--form'}>
                        {/* Drawer Header */}
                        <div className="kdp-drawer__header">
                            <div className="kdp-drawer__header-badge">
                                <span className="kdp-drawer__header-badge-label">FORMULIR</span>
                                <span className="kdp-drawer__header-badge-text">
                                    {editingUser ? 'Edit Data' : 'Generate Akun'}
                                </span>
                            </div>
                            <button type="button" onClick={() => setDrawerOpen(false)} className="kdp-drawer__close">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Drawer Form */}
                        <form onSubmit={handleSubmit} className="kdp-drawer__form">
                            {/* Role */}
                            {editingUser ? (
                                <div className="kdp-field">
                                    <label className="kdp-field__label">Peran / Hak Akses Portal</label>
                                    <div className="kdp-role-selector">
                                        {['student', 'tutor'].map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => form.setData('role', r)}
                                                className={`kdp-role-option ${
                                                    form.data.role === r
                                                        ? r === 'tutor' ? 'kdp-role-option--tutor-active' : 'kdp-role-option--student-active'
                                                        : ''
                                                }`}
                                            >
                                                {r === 'tutor' ? 'Tutor' : '🎓 Murid'}
                                            </button>
                                        ))}
                                    </div>
                                    {form.errors.role && <p className="kdp-field__error">{form.errors.role}</p>}
                                </div>
                            ) : (
                                <div className="kdp-role-locked">
                                    <div>
                                        <p className="kdp-role-locked__text-title">Tutor</p>
                                        <p className="kdp-role-locked__text-desc">Peran terkunci — Hanya akun tutor yang dapat ditambahkan.</p>
                                    </div>
                                </div>
                            )}

                            {/* Nama */}
                            <div className="kdp-field">
                                <label className="kdp-field__label">
                                    Nama Lengkap (Beserta Gelar) <span className="kdp-field__required">*Wajib</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="cth: Nadia Safira Putri, S.Pd."
                                    className="kdp-field__input"
                                />
                                {form.errors.name && <p className="kdp-field__error">{form.errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="kdp-field">
                                <label className="kdp-field__label">
                                    Alamat Email Utama <span className="kdp-field__required">*Wajib</span>
                                </label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    placeholder="cth: nama@dubes.ac.id"
                                    className="kdp-field__input"
                                />
                                {form.errors.email && <p className="kdp-field__error">{form.errors.email}</p>}
                            </div>

                            {/* No HP */}
                            <div className="kdp-field">
                                <label className="kdp-field__label">Nomor WhatsApp / HP Aktif</label>
                                <input
                                    type="text"
                                    value={form.data.no_hp}
                                    onChange={(e) => form.setData('no_hp', e.target.value)}
                                    placeholder="+62 812-xxxx-xxxx"
                                    className="kdp-field__input"
                                />
                                {form.errors.no_hp && <p className="kdp-field__error">{form.errors.no_hp}</p>}
                            </div>

                            {/* NIP (Opsional) */}
                            <div className="kdp-field">
                                <label className="kdp-field__label">
                                    NIP {editingUser && form.data.role === 'student' ? '/ NISN' : 'Tutor'} (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={form.data.nip}
                                    onChange={(e) => form.setData('nip', e.target.value)}
                                    placeholder={editingUser && form.data.role === 'student' ? 'cth: 0063921094' : 'cth: 19860412-2015-02'}
                                    className="kdp-field__input"
                                />
                                {form.errors.nip && <p className="kdp-field__error">{form.errors.nip}</p>}
                            </div>

                            {/* Status (hanya edit) */}
                            {editingUser && (
                                <div className="kdp-field">
                                    <label className="kdp-field__label">Status Akun</label>
                                    <select
                                        value={form.data.status_akun}
                                        onChange={(e) => form.setData('status_akun', e.target.value)}
                                        className="kdp-field__input"
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                </div>
                            )}

                            {/* Credential info (hanya create) */}
                            {!editingUser && (
                                <div className="kdp-credential-box">
                                    <div className="kdp-credential-box__title">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Ketentuan Kredensial Otomatis
                                    </div>
                                    <p className="kdp-credential-box__desc">
                                        Username dibuat sesuai format <strong>[peran].[nama].[tahun]</strong>.
                                        Sandi default sekali pakai akan diberikan setelah akun berhasil dibuat.
                                    </p>
                                </div>
                            )}
                        </form>

                        {/* Drawer Footer */}
                        <div className="kdp-drawer__footer">
                            <button type="button" onClick={() => setDrawerOpen(false)} className="btn-cancel">
                                Batal
                            </button>
                            <button type="button" disabled={form.processing} onClick={handleSubmit} className="btn-submit">
                                {form.processing ? (
                                    'Memproses...'
                                ) : (
                                    editingUser ? 'Simpan Perubahan' : 'Simpan & Daftarkan Tutor'
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════ MODAL: Konfirmasi Hapus ═══════ */}
            {deleteTarget && (
                <div className="kdp-modal-overlay">
                    <div className="kdp-modal kdp-modal--sm">
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: '#fff1f2', color: '#ef4444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Konfirmasi Penghapusan</h3>
                                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                        Yakin ingin menghapus akun <strong>{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setDeleteTarget(null)} className="btn-cancel">Batal</button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    style={{
                                        padding: '9px 18px', borderRadius: '10px', border: 'none',
                                        background: '#ef4444', color: 'white', fontSize: '13px',
                                        fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ MODAL: Konfirmasi Hapus Massal ═══════ */}
            {bulkDeleteOpen && (
                <div className="kdp-modal-overlay">
                    <div className="kdp-modal kdp-modal--sm">
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Hapus akun yang dipilih?</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                                Anda akan menghapus <strong>{selectedRows.length} akun</strong>. Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
                                <button type="button" disabled={bulkDeleting} onClick={() => setBulkDeleteOpen(false)} className="btn-cancel">Batal</button>
                                <button type="button" disabled={bulkDeleting} onClick={handleBulkDelete} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontSize: '13px', fontWeight: 700, cursor: bulkDeleting ? 'wait' : 'pointer', opacity: bulkDeleting ? 0.65 : 1 }}>
                                    {bulkDeleting ? 'Menghapus...' : `Ya, Hapus ${selectedRows.length} Akun`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ MODAL: Detail Pengguna ═══════ */}
            {detailUser && (
                <div className="kdp-modal-overlay">
                    <div className="kdp-modal kdp-modal--md">
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            background: detailUser.role === 'tutor'
                                ? 'linear-gradient(135deg, #312e81, #0f172a)'
                                : 'linear-gradient(135deg, #064e3b, #0f172a)',
                            color: 'white',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    {detailUser.avatar_url ? (
                                        <img
                                            src={detailUser.avatar_url}
                                            alt={`Foto profil ${detailUser.name}`}
                                            style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '50px', height: '50px', borderRadius: '14px',
                                            background: 'rgba(255,255,255,0.15)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: '18px',
                                        }}>
                                            {getInitials(detailUser.name)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{detailUser.name}</h3>
                                        <p style={{ fontSize: '12px', opacity: 0.7 }}>{roleLabel(detailUser.role)}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDetailUser(null)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)', border: 'none',
                                        borderRadius: '8px', padding: '6px', color: 'rgba(255,255,255,0.6)',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Email</p>
                                    <p style={{ fontWeight: 600, color: '#0f172a' }}>{detailUser.email}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>No. HP / WhatsApp</p>
                                    <p style={{ fontWeight: 600, color: '#0f172a' }}>{detailUser.no_hp || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{detailUser.role === 'tutor' ? 'NIP' : 'NIP / NISN'}</p>
                                    <p style={{ fontWeight: 600, color: '#0f172a' }}>{detailUser.nip || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Status Akun</p>
                                    <span className={`kdp-status kdp-status--${detailUser.status_akun}`}>
                                        <span className={`kdp-status-dot kdp-status-dot--${detailUser.status_akun}`}></span>
                                        {detailUser.status_akun === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Peran</p>
                                    <span className={`kdp-role-badge kdp-role-badge--${detailUser.role}`}>
                                        <span className={`kdp-role-dot kdp-role-dot--${detailUser.role}`}></span>
                                        {roleLabel(detailUser.role)}
                                    </span>
                                </div>
                                {detailUser.role === 'student' && (
                                    <div>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Level Kelas</p>
                                        <p style={{ fontWeight: 600, color: '#0f172a' }}>{detailUser.class_level || 'Belum ada hasil tes'}</p>
                                    </div>
                                )}
                                <div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Terdaftar Sejak</p>
                                    <p style={{ fontWeight: 600, color: '#0f172a' }}>
                                        {detailUser.created_at
                                            ? new Date(detailUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Footer */}
                        <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={() => { setDetailUser(null); openEditDrawer(detailUser); }} className="btn-submit">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Data
                            </button>
                            <button type="button" onClick={() => setDetailUser(null)} className="btn-cancel">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
