<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\LogService;
use Illuminate\Http\Request;

class LogController extends Controller
{
    /**
     * Display a listing of system logs.
     * Accessible by SuperAdmin.
     */
    public function index()
    {
        // Auto-cleanup older than 15 days on view
        LogService::cleanup(15);

        return response()->json(
            ActivityLog::with('user:id,name,role')
                ->latest()
                ->paginate(50)
        );
    }

    /**
     * Generic log endpoint for important frontend actions.
     */
    public function store(Request $request)
    {
        $request->validate([
            'action' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'required|in:success,failure'
        ]);

        LogService::log(
            $request->action,
            $request->description,
            $request->status
        );

        return response()->json(['message' => 'Log captured']);
    }
}
