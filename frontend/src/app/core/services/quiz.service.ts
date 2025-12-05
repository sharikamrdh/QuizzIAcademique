import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Question {
  id: number;
  question_type: 'qcm' | 'vf' | 'ouvert' | 'completion';
  text: string;
  choices: string[];
  correct_answer?: string;
  explanation?: string;
  points: number;
  order: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  course: number;
  course_title: string;
  difficulty: string;
  status: string;
  time_limit: number;
  passing_score: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  questions_count: number;
  total_points: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export interface QuizAttempt {
  id: number;
  quiz: number;
  quiz_title: string;
  status: string;
  score: number;
  points_earned: number;
  total_points: number;
  correct_answers: number;
  total_questions: number;
  time_spent: number;
  is_passed: boolean;
  started_at: string;
  completed_at: string | null;
  answers?: UserAnswer[];
}

export interface UserAnswer {
  id: number;
  question: number;
  question_text: string;
  answer: string;
  is_correct: boolean;
  points_earned: number;
  correct_answer: string;
  explanation: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  hint: string;
  order: number;
}

export interface GenerateQuizParams {
  course_id: number;
  document_ids?: number[];
  title?: string;
  nb_questions: number;
  difficulty: string;
  question_types: string[];
  time_limit: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly apiUrl = `${environment.apiUrl}/quizzes`;

  constructor(private http: HttpClient) {}

  getQuizzes(params?: {
    page?: number;
    search?: string;
    difficulty?: string;
    course?: number;
  }): Observable<PaginatedResponse<Quiz>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.difficulty) httpParams = httpParams.set('difficulty', params.difficulty);
    if (params?.course) httpParams = httpParams.set('course', params.course.toString());

    return this.http.get<PaginatedResponse<Quiz>>(`${this.apiUrl}/`, { params: httpParams });
  }

  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}/`);
  }

  generateQuiz(params: GenerateQuizParams): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.apiUrl}/generate/`, params);
  }

  updateQuiz(id: number, data: Partial<Quiz>): Observable<Quiz> {
    return this.http.patch<Quiz>(`${this.apiUrl}/${id}/`, data);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  publishQuiz(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/publish/`, {});
  }

  startAttempt(quizId: number): Observable<{
    attempt: QuizAttempt;
    questions: Question[];
  }> {
    return this.http.post<{ attempt: QuizAttempt; questions: Question[] }>(
      `${this.apiUrl}/${quizId}/start/`,
      {}
    );
  }

  submitAttempt(
    quizId: number,
    answers: { question_id: number; answer: string }[],
    timeSpent: number
  ): Observable<QuizAttempt> {
    return this.http.post<QuizAttempt>(`${this.apiUrl}/${quizId}/submit/`, {
      answers,
      time_spent: timeSpent,
    });
  }

  getFlashcards(quizId: number): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.apiUrl}/${quizId}/flashcards/`);
  }

  getAttempt(attemptId: number): Observable<QuizAttempt> {
    return this.http.get<QuizAttempt>(`${this.apiUrl}/attempts/${attemptId}/`);
  }

  getMyAttempts(): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.apiUrl}/my-attempts/`);
  }
}
