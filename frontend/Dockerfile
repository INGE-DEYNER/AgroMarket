FROM nginx:1.27-alpine

COPY . /usr/share/nginx/html/
RUN cp /usr/share/nginx/html/home.html /usr/share/nginx/html/index.html && \
	cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
	listen       80;
	server_name  agromarket.dev localhost;
	return 301 https://$host:8090$request_uri;
}

server {
	listen       443 ssl;
	server_name  agromarket.dev localhost;
	root   /usr/share/nginx/html;
	index  index.html home.html;

	ssl_certificate     /etc/nginx/certs/agromarket.dev.pem;
	ssl_certificate_key /etc/nginx/certs/agromarket.dev-key.pem;
	ssl_protocols       TLSv1.2 TLSv1.3;
	ssl_prefer_server_ciphers off;
	add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

	add_header X-Frame-Options DENY always;
	add_header X-Content-Type-Options nosniff always;
	add_header X-Cache-Status $upstream_cache_status always;
	proxy_set_header X-Forwarded-Host $http_host;

	location /api/ {
		proxy_pass http://agromarket-app:8080/api/;
		proxy_http_version 1.1;
		proxy_set_header Host $http_host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto https;
		proxy_set_header X-Forwarded-Port 443;
	}

	location /api-docs {
		proxy_pass http://agromarket-app:8080/api-docs;
		proxy_http_version 1.1;
		proxy_set_header Host $http_host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto https;
		proxy_set_header X-Forwarded-Port 443;
	}

	location /swagger-ui/ {
		proxy_pass http://agromarket-app:8080/swagger-ui/;
		proxy_http_version 1.1;
		proxy_set_header Host $http_host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto https;
		proxy_set_header X-Forwarded-Port 443;
	}

	location = /swagger-ui.html {
		proxy_pass http://agromarket-app:8080/swagger-ui.html;
		proxy_http_version 1.1;
		proxy_set_header Host $http_host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto https;
		proxy_set_header X-Forwarded-Port 443;
	}

	location /oauth2/ {
		proxy_pass http://agromarket-app:8080/oauth2/;
		proxy_http_version 1.1;
		proxy_set_header Host agromarket.dev:8090;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto https;
	}

	location /login/oauth2/ {
		proxy_pass http://agromarket-app:8080/login/oauth2/;
		proxy_http_version 1.1;
		proxy_set_header Host agromarket.dev:8090;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto https;
	}

	location /verificar/ {
		try_files $uri /verificar-correo.html;
	}

	# Allow direct access to login and registro pages (avoid catch-all redirection)
	location = /login {
		try_files $uri /login.html;
	}

	location = /registro {
		try_files $uri /registro.html;
	}

	location / {
		try_files $uri $uri/ /home.html;
	}
}
EOF

EXPOSE 80

