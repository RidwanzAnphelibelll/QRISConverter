#!/usr/bin/env node

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/') {
      const indexRequest = new Request(url.origin + '/public/index.html', {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      return env.ASSETS.fetch(indexRequest);
    }
    
    const newUrl = new URL(url);
    newUrl.pathname = '/public' + url.pathname;
    
    const newRequest = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    return env.ASSETS.fetch(newRequest);
  }
}
