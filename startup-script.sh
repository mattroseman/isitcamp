set -v

# Install logging monitor. The monitor will automatically pick up logs sent to
# syslog.
curl -s "https://storage.googleapis.com/signals-agents/logging/google-fluentd-install.sh" | bash
service google-fluentd restart &

# Install dependencies
apt-get update
add-apt-repository ppa:certbot/certbot
apt-get install -yq git supervisor build-essential nginx certbot

mkdir /opt/nodejs
curl https://nodejs.org/dist/v13.7.0/node-v13.7.0-linux-x64.tar.gz | tar xvzf - -C /opt/nodejs --strip-components=1
ln -s /opt/nodejs/bin/node /usr/bin/node
ln -s /opt/nodejs/bin/npm /usr/bin/npm

git clone --single-branch --branch master https://github.com/mattroseman/isitcamp /opt/app/isitcamp
cd /opt/app/isitcamp
npm install
npm run build

gsutil cp gs://isitcamp-data/movies.csv /opt/app/isitcamp/server/data/movies.csv

# setup isitcamp user to run the code server under
useradd -m -d /home/isitcamp isitcamp
chown -R isitcamp:isitcamp /opt/app/isitcamp

# Configure supervisor to run the node app.
cat >/etc/supervisor/conf.d/isitcamp.conf << EOF
[program:isitcamp]
directory=/opt/app/isitcamp
command=npm start
autostart=true
autorestart=true
user=isitcamp
environment=HOME="/home/isitcamp",USER="isitcamp",NODE_ENV="production",PORT=8080
stdout_logfile=syslog
stderr_logfile=syslog
EOF

cp /opt/app/isitcamp/nginx/nginx.conf /etc/nginx/nginx.conf

systemctl stop nginx.service
systemctl disable nginx.service

# Configure supervisor to run the nginx server
cat >/etc/supervisor/conf.d/nginx.conf << EOF
[program:isitcamp-reverse-proxy]
command=nginx
autostart=true
autorestart=true
user=root
stdout_logfile=syslog
stderr_logfile=syslog
EOF

supervisorctl reread
supervisorctl update
