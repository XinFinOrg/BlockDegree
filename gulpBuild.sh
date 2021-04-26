gulp build
if [[ -d /var/www/newuat.blockdegree.org/ ]]; then
  rm -r /var/www/newuat.blockdegree.org/*
else
  mkdir /var/www/newuat.blockdegree.org/
fi
cp -r ./dist/* /var/www/newuat.blockdegree.org/