package com.tabuadaquest.app;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.ArrayList;
import java.util.List;

final class NativeSaveDatabase extends SQLiteOpenHelper {

    static final class SyncEvent {
        final String id;
        final String type;
        final String payload;
        final long createdAt;

        SyncEvent(String id, String type, String payload, long createdAt) {
            this.id = id;
            this.type = type;
            this.payload = payload;
            this.createdAt = createdAt;
        }
    }

    private static final String DB_NAME = "tabuada_quest.db";
    private static final int DB_VERSION = 1;

    NativeSaveDatabase(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(
            "CREATE TABLE player_state (" +
            "id INTEGER PRIMARY KEY CHECK(id = 1)," +
            "payload TEXT NOT NULL," +
            "updated_at INTEGER NOT NULL" +
            ")"
        );
        db.execSQL(
            "CREATE TABLE sync_events (" +
            "id TEXT PRIMARY KEY," +
            "event_type TEXT NOT NULL," +
            "payload TEXT NOT NULL," +
            "created_at INTEGER NOT NULL," +
            "synced_at INTEGER" +
            ")"
        );
        db.execSQL(
            "CREATE INDEX idx_sync_events_pending " +
            "ON sync_events(synced_at, created_at)"
        );
        db.execSQL(
            "CREATE TABLE sync_meta (" +
            "key TEXT PRIMARY KEY," +
            "value TEXT" +
            ")"
        );
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Migrações futuras entram aqui. Nunca apagar save silenciosamente.
    }

    synchronized String getState() {
        try (Cursor cursor = getReadableDatabase().query(
            "player_state",
            new String[]{"payload"},
            "id = 1",
            null,
            null,
            null,
            null
        )) {
            return cursor.moveToFirst() ? cursor.getString(0) : "";
        }
    }

    synchronized long getStateUpdatedAt() {
        try (Cursor cursor = getReadableDatabase().query(
            "player_state",
            new String[]{"updated_at"},
            "id = 1",
            null,
            null,
            null,
            null
        )) {
            return cursor.moveToFirst() ? cursor.getLong(0) : 0L;
        }
    }

    synchronized void saveState(String payload) {
        saveState(payload, System.currentTimeMillis());
    }

    synchronized void saveState(String payload, long updatedAt) {
        ContentValues values = new ContentValues();
        values.put("id", 1);
        values.put("payload", payload);
        values.put("updated_at", updatedAt);
        getWritableDatabase().insertWithOnConflict(
            "player_state",
            null,
            values,
            SQLiteDatabase.CONFLICT_REPLACE
        );
    }

    synchronized void enqueueEvent(String id, String type, String payload, long createdAt) {
        ContentValues values = new ContentValues();
        values.put("id", id);
        values.put("event_type", type);
        values.put("payload", payload);
        values.put("created_at", createdAt);
        values.putNull("synced_at");
        getWritableDatabase().insertWithOnConflict(
            "sync_events",
            null,
            values,
            SQLiteDatabase.CONFLICT_IGNORE
        );
    }

    synchronized List<SyncEvent> getPendingEvents(int limit) {
        List<SyncEvent> events = new ArrayList<>();
        try (Cursor cursor = getReadableDatabase().query(
            "sync_events",
            new String[]{"id", "event_type", "payload", "created_at"},
            "synced_at IS NULL",
            null,
            null,
            null,
            "created_at ASC",
            String.valueOf(Math.max(1, limit))
        )) {
            while (cursor.moveToNext()) {
                events.add(new SyncEvent(
                    cursor.getString(0),
                    cursor.getString(1),
                    cursor.getString(2),
                    cursor.getLong(3)
                ));
            }
        }
        return events;
    }

    synchronized int getPendingEventCount() {
        try (Cursor cursor = getReadableDatabase().rawQuery(
            "SELECT COUNT(*) FROM sync_events WHERE synced_at IS NULL",
            null
        )) {
            return cursor.moveToFirst() ? cursor.getInt(0) : 0;
        }
    }

    synchronized void markEventsSynced(List<SyncEvent> events, long syncedAt) {
        SQLiteDatabase db = getWritableDatabase();
        db.beginTransaction();
        try {
            ContentValues values = new ContentValues();
            values.put("synced_at", syncedAt);
            for (SyncEvent event : events) {
                db.update(
                    "sync_events",
                    values,
                    "id = ? AND synced_at IS NULL",
                    new String[]{event.id}
                );
            }
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
    }

    synchronized void putMeta(String key, String value) {
        ContentValues values = new ContentValues();
        values.put("key", key);
        values.put("value", value);
        getWritableDatabase().insertWithOnConflict(
            "sync_meta",
            null,
            values,
            SQLiteDatabase.CONFLICT_REPLACE
        );
    }

    synchronized String getMeta(String key) {
        try (Cursor cursor = getReadableDatabase().query(
            "sync_meta",
            new String[]{"value"},
            "key = ?",
            new String[]{key},
            null,
            null,
            null
        )) {
            return cursor.moveToFirst() ? cursor.getString(0) : "";
        }
    }
}
