FROM nginx:1.27-alpine

COPY . /usr/share/nginx/html/
RUN cp /usr/share/nginx/html/home.html /usr/share/nginx/html/index.html && \
	cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
	listen       80;
	server_name  _;
	root   /usr/share/nginx/html;
	index  index.html home.html;

	add_header X-Frame-Options DENY always;
	add_header X-Content-Type-Options nosniff always;
	add_header X-Cache-Status $upstream_cache_status always;

	location /api/ {
		proxy_pass http://app:8080/api/;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location /api-docs {
		proxy_pass http://app:8080/api-docs;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location /swagger-ui/ {
		proxy_pass http://app:8080/swagger-ui/;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location = /swagger-ui.html {
		proxy_pass http://app:8080/swagger-ui.html;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location /oauth2/ {
		proxy_pass http://app:8080/oauth2/;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location /login/oauth2/ {
		proxy_pass http://app:8080/login/oauth2/;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location /verificar/ {
		try_files $uri /verificar-correo.html;
	}

	location / {
		try_files $uri $uri/ /home.html;
	}
}
EOF

EXPOSE 80

