export const notFoundHandler = (request, reply) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 Not Found</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
          color: #444;
          background-color: #f5f5f5;
          margin: 0;
          padding: 30px;
          line-height: 1.6;
        }
        
        .container {
          max-width: 650px;
          margin: 0 auto;
          background-color: #fff;
          padding: 30px;
          border: 1px solid #ddd;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
          font-size: 24px;
          color: #d14;
          margin-top: 0;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        p {
          margin: 15px 0;
        }
        
        .details {
          background-color: #f9f9f9;
          padding: 15px;
          border: 1px solid #eee;
          margin: 20px 0;
          font-family: monospace;
          font-size: 14px;
          overflow-x: auto;
        }
        
        .details p {
          margin: 5px 0;
        }
        
        .error-code {
          color: #d14;
          font-weight: bold;
        }
        
        .home-link {
          display: inline-block;
          margin-top: 20px;
          color: #d14;
          text-decoration: none;
        }
        
        .home-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404 Not Found</h1>
        
        <p>The requested URL <code>${request.url}</code> was not found on this server.</p>
        
        <div class="details">
          <p><span class="error-code">Error Code:</span> 404</p>
          <p><span class="error-code">Error Message:</span> Not Found</p>
          <p><span class="error-code">Request ID:</span> ${request.id}</p>
          <p><span class="error-code">Remote Address:</span> ${request.ip || "Unknown"}</p>
          <p><span class="error-code">Server Time:</span> ${new Date().toUTCString()}</p>
        </div>
        
        <p>We couldn't find the page you were looking for. It might have been moved, deleted, or perhaps never existed. If you believe this is an error, please contact the system administrator.</p>
        
        <a href="/" class="home-link">← Back to Homepage</a>
      </div>
    </body>
    </html>
  `;
    return reply.status(404).type("text/html").send(html);
};
