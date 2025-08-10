db = db.getSiblingDB('admin');

if (db.system.users.find({ user: 'root' }).count() === 0) {
  db.createUser({
    user: 'root',
    pwd: 'password',
    roles: [{ role: 'root', db: 'admin' }]
  });
}

db = db.getSiblingDB('hauska');

db.createUser({
  user: 'hauska_user',
  pwd: 'hauska_password',
  roles: [{ role: 'readWrite', db: 'hauska' }]
});