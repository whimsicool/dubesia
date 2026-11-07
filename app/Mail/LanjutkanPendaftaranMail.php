<?php

namespace App\Mail;

use App\Models\Pendaftaran;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class LanjutkanPendaftaranMail extends Mailable
{
    public function __construct(
        public Pendaftaran $pendaftaran,
        public string $lanjutkanUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), 'Dubes Communications'),
            subject: 'Lanjutkan Pendaftaran Dubes Communications',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.lanjutkan-pendaftaran');
    }
}
