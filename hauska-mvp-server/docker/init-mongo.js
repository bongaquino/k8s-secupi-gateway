db = db.getSiblingDB('admin');

if (db.system.users.find({ user: 'root' }).count() === 0) {
  db.createUser({
    user: 'root',
    pwd: 'password',
    roles: [{ role: 'root', db: 'admin' }]
  });
}

db = db.getSiblingDB('bongaquino');

db.createUser({
  user: 'bongaquino_user',
  pwd: 'bongaquino_password',
  roles: [{ role: 'readWrite', db: 'bongaquino' }]
});