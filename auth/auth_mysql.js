// Authentication against a MySQL server
var net_utils = require('./net_utils');
var mysql = require('mysql');
var crypto = require('crypto');

exports.register = function() {
	this.inherits('auth/auth_base');
}

exports.hook_capabilities = function(next, connection) {
	// Do not allow AUTH unless private IP or encrypted
	if (!net_utils.is_rfc1918(connection.remote_ip) && !connection.using_tls) {
		return next();
	}

	var methods = [ 'PLAIN' ];
	connection.capabilities.push('AUTH ' + methods.join(' '));
	connection.notes.allowed_auth_methods = methods;

	return next();
}

exports.get_plain_passwd = function(user, cb) {
	if (!server.notes.auth_mysql || !server.notes.auth_mysql.pool) {
		var config = this.config.get('auth_mysql.ini', {
			host: 'localhost',
			port: 3306,
			char_set: 'UTF8_GENERAL_CI',
			ssl: false,
			password_query: 'SELECT password FROM users WHERE user=?'
		});

		server.notes.auth_mysql = {
			config: config,
			pool  : mysql.createPool({
				host : config.main.host,
				port : config.main.port,
				charset: config.main.charset,
				user : config.main.user,
				password: config.main.password,
				database: config.main.database,
			})
		};
	}

	var plugin = this;
	var myNotes = server.notes.auth_mysql;
	myNotes.pool.getConnection(function(err, conn) {
		if (err) {
			plugin.logerror("MySQL error: " + err);
			return next(DENYSOFT);
		}
			
		conn.query(myNotes.config.main.password_query, [user], function(err, results) {
			if (err) {
				plugin.logerror("MySQL error: " + err);
				return next(DENYSOFT);
			}

			if (results && results.length > 0) {
				cb(results[0].password);
			} else {
				cb();
			}
		});
	});
}

exports.check_plain_passwd = function (connection, user, passwd, cb) {
	var plugin = this;   
	this.get_plain_passwd(user, function (plain_pw) {
		if (plain_pw === null) {
			return cb(false);
		}

		var passwd_md5_enc = crypto.createHash('md5').update(passwd).digest('hex');
		if (plain_pw === passwd_md5_enc) {
			return cb(true);
		}

		return cb(false);
	});
}
