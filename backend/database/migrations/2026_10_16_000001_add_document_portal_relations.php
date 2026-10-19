<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->after('password');
        });

        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('document_requests', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')
                ->constrained()->nullOnDelete();
            $table->foreignId('document_type_id')->nullable()->after('document_type')
                ->constrained()->nullOnDelete();
        });

        Schema::create('document_request_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_request_id')
                ->constrained()->cascadeOnDelete();
            $table->foreignId('changed_by')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_request_status_histories');
        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('document_type_id');
            $table->dropConstrainedForeignId('user_id');
        });
        Schema::dropIfExists('document_types');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
