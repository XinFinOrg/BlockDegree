if [[ -d /var/www/corporate.blockdegree.org/ ]]; then
  rm -r /var/www/corporate.blockdegree.org/*
else
  mkdir /var/www/corporate.blockdegree.org/
fi
cd ./server/corporate-view && npm i
cp -r ./build/var/www/newuat.blockdegree.org/