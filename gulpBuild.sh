gulp build
if [[ -d /var/www/blockdegree.org/ ]]; then
  rm -r /var/www/blockdegree.org/*
else
  mkdir /var/www/blockdegree.org/
fi
cp -r ./dist/* /var/www/blockdegree.org/
