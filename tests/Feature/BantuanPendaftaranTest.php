<?php

namespace Tests\Feature;

use Tests\TestCase;

class BantuanPendaftaranTest extends TestCase
{
    public function test_panduan_pendaftaran_page_renders(): void
    {
        $response = $this->get(route('panduan-pendaftaran'));

        $response
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Registrasi/PanduanPendaftaran'));
    }

    public function test_bantuan_admisi_page_renders(): void
    {
        $response = $this->get(route('bantuan-admisi'));

        $response
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Registrasi/BantuanAdmisi'));
    }
}
