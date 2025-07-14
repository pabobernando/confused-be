export const homeHandler = (request, reply) => {
    const version = "0.0.91";
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CONFUSED TOURNAMENT API</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          color: #333;
          margin: 40px auto;
          max-width: 650px;
          padding: 0 10px;
          background-color: #f8f9fa;
        }

        h1 {
          font-size: 28px;
          font-weight: 600;
          color: rgb(226, 46, 46);
          margin: 30px 0 20px 0;
          padding: 15px 20px;
          border-radius: 6px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-left: 5px solid rgb(226, 46, 46);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          text-align: center;
          letter-spacing: 0.5px;
        }

        p {
          font-size: 16px;
          color: #495057;
          margin: 15px 0;
        }

        .server-info {
          background-color: #fff;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .server-info p {
          margin: 8px 0;
          font-size: 14px;
        }

        .server-info .label {
          display: inline-block;
          width: 140px;
          color: #6c757d;
          font-weight: 500;
        }

        .footer {
          margin-top: 30px;
          font-size: 13px;
          color: #6c757d;
          text-align: center;
          padding-top: 15px;
          border-top: 1px solid #dee2e6;
        }
      </style>
    </head>
    <body>
      <h1>Bestforia API</h1>

      <div class="server-info">
        <p><span class="label">API Version:</span> ${version}</p>
        <p><span class="label">Server Time:</span> ${new Date().toUTCString()}</p>
        <p><span class="label">Request ID:</span> ${request.id}</p>
        <p><span class="label">Client IP:</span> ${request.ip}</p>
      </div>

      <p>Thank you for using Bestforia App.</p>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Kewr Digital</p>
      </div>
    </body>
    </html>
  `;
    return reply.status(200).type("text/html").send(html);
};
