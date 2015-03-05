[ ![Codeship Status for hofan41/DownloadManager](https://codeship.com/projects/91fe1280-a43a-0132-995a-12052818d981/status?branch=master)](https://codeship.com/projects/66348)
### DownloadManager
Front end for amazon web services S3 built using Hapi, jQuery datatables, and socket.io.

### Configuration
DownloadManager is configured through the use of environment variables.

Env. Variable Name  | Description
-------------: | :-------------
**PORT**  | Server connection port.
**SITE_TITLE**  | Title of all web pages served from DownloadManager.
**AWS_ACCESS_KEY_ID** | Self explanatory. Used to access your AWS S3 account.
**AWS_SECRET_ACCESS_KEY** | Same as above.
**AWS_S3_BUCKET** | The name of the bucket in S3 the DownloadManager will utilize for uploads/downloads.
