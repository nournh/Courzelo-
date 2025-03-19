import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {PaginatedPostsResponse} from '../../models/Forum/PaginatedPostsResponse';
import {PostResponse} from '../../models/Forum/PostResponse';
import {CreatePostRequest} from '../../models/Forum/CreatePostRequest';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseUrl = 'http://localhost:8080/api/v1/post';

  constructor(private http: HttpClient) {}

  getPostsByThread(threadID: string, page: number, keyword: string | null, sizePerPage: number): Observable<PaginatedPostsResponse> {
    let params = new HttpParams().set('page', page.toString()).set('sizePerPage', sizePerPage.toString());
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<PaginatedPostsResponse>(`${this.baseUrl}/${threadID}/all`, { params });
  }

  getPost(postID: string): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${this.baseUrl}/${postID}`);
  }

  createPost(postRequest: CreatePostRequest) {
    return this.http.post(`${this.baseUrl}/create`, postRequest);
  }

  updatePost(postID: string, postRequest: CreatePostRequest) {
    return this.http.put(`${this.baseUrl}/${postID}/update`, postRequest);
  }

  deletePost(postID: string) {
    return this.http.delete(`${this.baseUrl}/${postID}/delete`);
  }
}
