Plugins for the Haraka SMTP Server
==================================

These are simple plugins written by a non-Haraka, non-SMTP and non-Mail
guru, so...

auth/auth_mysql.js
------------------

Create a config/auth_mysql.ini file containing at least:

* user: username to connect to MySQL as
* password: password to authenticate with MySQL with

Optionally:

* host: MySQL hostname (default=localhost)
* port: MySQL port (default=3306)
* charset: Character encoding (default=UTF8_GENERAL_CI)
* ssl: Securely connect (default=false)
* password_query: Query to get the password (default=SELECT password FROM users WHERE user=?)

