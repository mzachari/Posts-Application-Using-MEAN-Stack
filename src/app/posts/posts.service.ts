import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';
@Injectable({providedIn: 'root'})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new  Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&pages=${currentPage}`;
    this.http.get<{message: string, posts: any, postCount: number}>(BACKEND_URL + queryParams)
             .pipe(map((postData) => {
               return { posts: postData.posts.map((post) => {
                 return {
                   title: post.title,
                   content: post.content,
                   id: post._id,
                   imagePath: post.imagePath,
                   creator: post.creator
                 };
               }), postCount: postData.postCount};
             }))
             .subscribe((transformedPosts) => {
                this.posts = transformedPosts.posts;
                this.postsUpdated.next({posts: [...this.posts], postCount: transformedPosts.postCount});
              });
  }
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }
  getPost(postId: string) {
    // tslint:disable-next-line: max-line-length
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>('http://localhost:3000/api/posts/' + postId);
  }
  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{message: string, post: Post} > (BACKEND_URL, postData).subscribe((responseData) => {
      this.router.navigate(['/']);
    });
  }
  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null
      };
    }
    this.http.put<{message: string, post: Post}>(BACKEND_URL + id, postData).subscribe((result) => {
      this.router.navigate(['/']);
    });
  }
  deletePost(postId: string) {
    return this.http.delete<{message: string}>(BACKEND_URL + postId);
  }

}
