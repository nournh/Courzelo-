import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {PaginatedCommentsResponse} from '../../models/Forum/PaginatedCommentsResponse';
import {CommentResponse} from '../../models/Forum/CommentResponse';
import {StatusMessageResponse} from '../../models/user/StatusMessageResponse';
import {CreateCommentRequest} from '../../models/Forum/CreateCommentRequest';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = 'http://localhost:8080/api/v1/comment';

  constructor(private http: HttpClient) { }

  getCommentsByPost(postID: string, page: number, sizePerPage: number) {
    const params = new HttpParams().set('page', page.toString()).set('sizePerPage', sizePerPage.toString());
    return this.http.get<PaginatedCommentsResponse>(`${this.baseUrl}/${postID}/all`, { params });
  }

  getComment(commentID: string): Observable<CommentResponse> {
    return this.http.get<CommentResponse>(`${this.baseUrl}/${commentID}`);
  }

  createComment(postID: string, commentRequest: CreateCommentRequest) {
    return this.http.post(`${this.baseUrl}/${postID}/create`, commentRequest);
  }

  updateComment(commentID: string, commentRequest: CreateCommentRequest) {
    return this.http.put(`${this.baseUrl}/${commentID}/update`, commentRequest);
  }

  deleteComment(commentID: string) {
    return this.http.delete(`${this.baseUrl}/${commentID}/delete`);
  }
}
