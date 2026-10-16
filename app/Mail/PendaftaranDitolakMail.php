<?php

namespace App\Mail;

use App\Models\Pendaftaran;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class PendaftaranDitolakMail extends Mailable
{
    public function __construct(public Pendaftaran $pendaftaran) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Perbaikan Data Pendaftaran DUBESIA');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.pendaftaran-ditolak');
    }
}