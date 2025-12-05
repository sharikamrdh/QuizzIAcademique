import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  thumbnail: string | null;
  owner: number;
  owner_name: string;
  is_public: boolean;
  documents_count: number;
  is_enrolled: boolean;
  created_at: string;
  updated_at: string;
  documents?: Document[];
  total_text_length?: number;
}

export interface Document {
  id: number;
  title: string;
  file: string;
  file_type: string;
  file_size: number;
  processing_status: string;
  processing_error: string;
  uploaded_by: number;
  uploaded_by_name: string;
  extracted_text_length: number;
  extracted_text?: string;
  created_at: string;
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
export class CourseService {
  private readonly apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  getCourses(params?: {
    page?: number;
    search?: string;
    category?: string;
  }): Observable<PaginatedResponse<Course>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.category) httpParams = httpParams.set('category', params.category);

    return this.http.get<PaginatedResponse<Course>>(`${this.apiUrl}/`, { params: httpParams });
  }

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}/`);
  }

  createCourse(data: {
    title: string;
    description?: string;
    category?: string;
    is_public?: boolean;
  }): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/`, data);
  }

  updateCourse(id: number, data: Partial<Course>): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/${id}/`, data);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  uploadDocument(courseId: number, file: File, title?: string): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    return this.http.post<Document>(`${this.apiUrl}/${courseId}/upload/`, formData);
  }

  getDocument(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/documents/${id}/`);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${id}/`);
  }

  reprocessDocument(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/documents/${id}/reprocess/`, {});
  }

  enrollCourse(courseId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${courseId}/enroll/`, {});
  }

  unenrollCourse(courseId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${courseId}/unenroll/`, {});
  }

  getMyEnrollments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-enrollments/`);
  }
}
