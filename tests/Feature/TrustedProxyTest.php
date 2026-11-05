<?php

namespace Tests\Feature;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TrustedProxyTest extends TestCase
{
    public function test_https_from_caddy_is_used_without_trusting_forwarded_host(): void
    {
        Route::get('/proxy-check', fn (Request $request) => ['url' => $request->url()]);
        $this->get('/proxy-check', [
            'X-Forwarded-Proto' => 'https',
            'X-Forwarded-Host' => 'untrusted.example.com',
        ])->assertOk()->assertJsonPath('url', 'https://localhost/proxy-check');
    }
}
