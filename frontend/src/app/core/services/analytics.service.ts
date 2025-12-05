import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface DashboardData {
  summary: {
    total_quizzes: number;
    passed_quizzes: number;
    avg_score: number;
    total_time_minutes: number;
    total_points: number;
    level: number;
    enrollments: number;
  };
  daily_activity: {
    date: string;
    count: number;
    avg_score: number;
  }[];
  by_difficulty: {
    quiz__difficulty: string;
    count: number;
    avg_score: number;
  }[];
  question_performance: {
    type: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
  badges: {
    name: string;
    icon: string;
    type: string;
    earned_at: string;
  }[];
  recent_quizzes: {
    quiz_title: string;
    score: number;
    completed_at: string;
    passed: boolean;
  }[];
}

export interface HistoryResponse {
  results: {
    id: number;
    quiz_id: number;
    quiz_title: string;
    course_title: string;
    score: number;
    correct_answers: number;
    total_questions: number;
    time_spent: number;
    passed: boolean;
    completed_at: string;
  }[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProgressData {
  period_days: number;
  progress: {
    date: string;
    quizzes_completed: number;
    avg_score: number;
    points_earned: number;
    time_spent_minutes: number;
    cumulative_points: number;
    cumulative_quizzes: number;
  }[];
  summary: {
    total_quizzes: number;
    total_points: number;
  };
}

export interface WeakAreasData {
  weak_areas: {
    course: string;
    total_incorrect: number;
    questions: {
      question: string;
      correct_answer: string;
      your_answer: string;
    }[];
  }[];
  recommendations: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard/`);
  }

  getHistory(params?: { page?: number; page_size?: number }): Observable<HistoryResponse> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());

    return this.http.get<HistoryResponse>(`${this.apiUrl}/history/`, { params: httpParams });
  }

  getProgress(days: number = 30): Observable<ProgressData> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ProgressData>(`${this.apiUrl}/progress/`, { params });
  }

  getWeakAreas(): Observable<WeakAreasData> {
    return this.http.get<WeakAreasData>(`${this.apiUrl}/weak-areas/`);
  }
}
