<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class AkunTutorMail extends Mailable
{
    public function __construct(
        public User $tutor,
        public string $password,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), 'Dubes Communications'),
            subject: 'Akun Tutor Dubes Communications',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.akun-tutor');
    }
}
