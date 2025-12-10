import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  event_type: 'exam' | 'revision' | 'td' | 'course' | 'reminder' | 'other';
  start_date: string;
  end_date?: string;
  all_day: boolean;
  location?: string;
  color?: string;
  is_completed: boolean;
  course?: number;
}

export interface StudyPlan {
  id?: number;
  course: number;
  exam_date: string;
  start_date: string;
  hours_per_day: number;
  priority_level: number;
  is_active: boolean;
  is_completed: boolean;
}

export interface StudySession {
  id?: number;
  study_plan: number;
  date: string;
  start_time: string;
  end_time: string;
  topic: string;
  description?: string;
  is_completed: boolean;
  difficulty_rating?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = `${environment.apiUrl}/calendar`;

  constructor(private http: HttpClient) {}

  // Events
  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/events/`);  // ← Parenthèses ajoutées
  }

  getEvent(id: number): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.apiUrl}/events/${id}/`);  // ← Parenthèses ajoutées
  }

  createEvent(event: CalendarEvent): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.apiUrl}/events/`, event);  // ← Parenthèses ajoutées
  }

  updateEvent(id: number, event: CalendarEvent): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.apiUrl}/events/${id}/`, event);  // ← Parenthèses ajoutées
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}/`);  // ← Parenthèses ajoutées
  }

  // Study Plans
  getStudyPlans(): Observable<StudyPlan[]> {
    return this.http.get<StudyPlan[]>(`${this.apiUrl}/study-plans/`);  // ← Parenthèses ajoutées
  }

  createStudyPlan(plan: StudyPlan): Observable<StudyPlan> {
    return this.http.post<StudyPlan>(`${this.apiUrl}/study-plans/`, plan);  // ← Parenthèses ajoutées
  }

  // Study Sessions
  getStudySessions(): Observable<StudySession[]> {
    return this.http.get<StudySession[]>(`${this.apiUrl}/study-sessions/`);  // ← Parenthèses ajoutées
  }

  updateStudySession(id: number, session: Partial<StudySession>): Observable<StudySession> {
    return this.http.patch<StudySession>(`${this.apiUrl}/study-sessions/${id}/`, session);  // ← Parenthèses ajoutées
  }
}
