<?php

namespace Tests\Feature;

use App\Models\Pendaftaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LandingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_sees_the_landing_page_with_every_program(): void
    {
        $this->get(route('landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Landing/Index')
                ->has('programs', count(Pendaftaran::PROGRAMS))
                ->where('programs.0.value', 'diplomatic_speech')
                ->where('programs.0.label', 'Diplomatic Speech & Rhetoric')
                ->has('programs.0.deskripsi'));
    }

    public function test_authenticated_user_is_redirected_to_the_dashboard(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('landing'))
            ->assertRedirect(route('dashboard'));
    }
}
