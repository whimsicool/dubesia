@php
    $logoPath = public_path('images/dubesia-logo.png');
    $logoSrc = is_file($logoPath) ? 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath)) : null;
@endphp

<style>
    .kop {
        width: 100%;
        border-collapse: collapse;
        margin: 0;
    }

    .kop td {
        border: 0;
        padding: 0;
        vertical-align: middle;
    }

    .kop-logo {
        width: 56px;
        height: 56px;
    }

    .kop-name {
        margin: 0;
        color: #0f1b2d;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 0.5px;
    }

    .kop-sub {
        margin: 2px 0 0;
        color: #334155;
        font-size: 9px;
    }

    .kop-address {
        margin: 2px 0 0;
        color: #64748b;
        font-size: 8.5px;
    }

    .kop-rule {
        margin-top: 8px;
        border-top: 2px solid #0f1b2d;
        border-bottom: 1px solid #cbd5e1;
        height: 2px;
    }

    .kop-title {
        margin: 12px 0 2px;
        color: #0f1b2d;
        font-size: 13px;
        font-weight: bold;
        text-align: center;
        letter-spacing: 0.4px;
    }

    .kop-meta {
        margin: 0 0 14px;
        color: #475569;
        font-size: 9px;
        text-align: center;
    }
</style>

<table class="kop">
    <tr>
        @if ($logoSrc)
            <td style="width: 66px;">
                <img src="{{ $logoSrc }}" class="kop-logo" alt="Logo DUBESIA">
            </td>
        @endif
        <td>
            <p class="kop-name">DUBESIA — DUTA BAHASA EDUKASI SEMESTA</p>
            <p class="kop-sub">Lembaga Pelatihan Bahasa Inggris, Etiket, dan Retorika</p>
            <p class="kop-address">Jl. Taman Karya, Tuah Karya, Tuah Madani, Kota Pekanbaru, Riau 28293</p>
        </td>
    </tr>
</table>

<div class="kop-rule"></div>
