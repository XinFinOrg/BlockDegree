gulp build
if [[ -d /var/www/uat.blockdegree.org/ ]]; then
  rm -r /var/www/uat.blockdegree.org/*
else
  mkdir /var/www/uat.blockdegree.org/
fi
cp -r ./dist/* /var/www/uat.blockdegree.org/
