<?php

namespace Tests\Feature\Tutor;

use App\Models\CourseClass;
use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentGradeAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_lists_grades_of_the_tutors_own_classes_only(): void
    {
        $tutor = $this->tutor();
        $ownGrade = $this->gradeFor($tutor);

        $this->gradeFor($this->tutor());

        $response = $this->actingAs($tutor)->get('/tutor/student-grades');

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Tutor/StudentGrades/Index')
                ->has('grades', 1)
                ->where('grades.0.id', $ownGrade->id)
        );
    }

    public function test_the_create_form_only_offers_the_tutors_classes_and_students(): void
    {
        $tutor = $this->tutor();
        $courseClass = $this->classWithStudent($tutor);
        $ownStudent = $courseClass->students()->first();

        $this->classWithStudent($this->tutor());

        $response = $this->actingAs($tutor)
            ->get('/tutor/student-grades/create');

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Tutor/StudentGrades/Create')
                ->has('classes', 1)
                ->where('classes.0.id', $courseClass->id)
                ->has('students', 1)
                ->where('students.0.id', $ownStudent->id)
        );
    }

    public function test_a_tutor_cannot_open_the_edit_form_of_another_class_grade(): void
    {
        $grade = $this->gradeFor($this->tutor());

        $response = $this->actingAs($this->tutor())
            ->get("/tutor/student-grades/{$grade->id}/edit");

        $response->assertForbidden();
    }

    public function test_a_tutor_cannot_update_a_grade_of_another_class(): void
    {
        $grade = $this->gradeFor($this->tutor());

        $response = $this->actingAs($this->tutor())->put(
            "/tutor/student-grades/{$grade->id}",
            [
                'student_id' => $grade->student_id,
                'subject' => 'CHANGED-BY-OTHER-TUTOR',
                'score' => 10,
            ]
        );

        $response->assertForbidden();
        $this->assertSame('80.00', $grade->refresh()->score);
        $this->assertNotSame('CHANGED-BY-OTHER-TUTOR', $grade->subject);
    }

    public function test_a_tutor_cannot_delete_a_grade_of_another_class(): void
    {
        $grade = $this->gradeFor($this->tutor());

        $response = $this->actingAs($this->tutor())
            ->delete("/tutor/student-grades/{$grade->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('student_grades', ['id' => $grade->id]);
    }

    public function test_a_tutor_cannot_store_a_grade_in_a_class_they_do_not_teach(): void
    {
        $courseClass = $this->classWithStudent($this->tutor());
        $student = $courseClass->students()->first();

        $response = $this->actingAs($this->tutor())->post(
            '/tutor/student-grades',
            [
                'class_id' => $courseClass->id,
                'student_id' => $student->id,
                'subject' => 'Forbidden Grade',
                'score' => 70,
            ]
        );

        $response->assertForbidden();
        $this->assertDatabaseCount('student_grades', 0);
    }

    public function test_storing_a_grade_requires_a_student_enrolled_in_the_class(): void
    {
        $tutor = $this->tutor();
        $courseClass = $this->classWithStudent($tutor);
        $outsider = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($tutor)->post('/tutor/student-grades', [
            'class_id' => $courseClass->id,
            'student_id' => $outsider->id,
            'subject' => 'Unenrolled Grade',
            'score' => 70,
        ]);

        $response->assertSessionHasErrors('student_id');
        $this->assertDatabaseCount('student_grades', 0);
    }

    public function test_a_tutor_can_manage_grades_of_their_own_class(): void
    {
        $tutor = $this->tutor();
        $courseClass = $this->classWithStudent($tutor);
        $student = $courseClass->students()->first();

        $this->actingAs($tutor)
            ->post('/tutor/student-grades', [
                'class_id' => $courseClass->id,
                'student_id' => $student->id,
                'subject' => 'English Grammar',
                'score' => 75,
            ])
            ->assertRedirect('/tutor/student-grades');

        $grade = StudentGrade::firstOrFail();
        $this->assertSame($courseClass->id, $grade->class_id);

        $this->actingAs($tutor)
            ->put("/tutor/student-grades/{$grade->id}", [
                'student_id' => $student->id,
                'subject' => 'English Grammar',
                'score' => 90,
            ])
            ->assertRedirect('/tutor/student-grades');

        $this->assertSame('90.00', $grade->refresh()->score);

        $this->actingAs($tutor)
            ->delete("/tutor/student-grades/{$grade->id}")
            ->assertRedirect('/tutor/student-grades');

        $this->assertDatabaseCount('student_grades', 0);
    }

    public function test_the_broken_show_route_is_gone(): void
    {
        $this->assertFalse(Route::has('tutor.student-grades.show'));

        $grade = $this->gradeFor($this->tutor());

        $this->actingAs($this->tutor())
            ->get("/tutor/student-grades/{$grade->id}")
            ->assertMethodNotAllowed();
    }

    private function tutor(): User
    {
        return User::factory()->create(['role' => 'tutor']);
    }

    /**
     * Create a class taught by the given tutor with one enrolled student.
     */
    private function classWithStudent(User $tutor): CourseClass
    {
        $student = User::factory()->create(['role' => 'student']);

        $courseClass = CourseClass::create([
            'name' => 'Class '.Str::random(6),
        ]);

        $courseClass->tutors()->attach($tutor->id);
        $courseClass->students()->attach($student->id);

        return $courseClass;
    }

    private function gradeFor(User $tutor): StudentGrade
    {
        $courseClass = $this->classWithStudent($tutor);

        return StudentGrade::create([
            'student_id' => $courseClass->students()->first()->id,
            'class_id' => $courseClass->id,
            'subject' => $courseClass->name,
            'score' => 80,
        ]);
    }
}
