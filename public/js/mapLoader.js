var boundingBoxes = [];

function createMap(){
  //-----------------------------------------------------
  // create Floor
  var texture = new THREE.TextureLoader().load("http://localhost:8080/asset/texture?id=cobble.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(32, 32);

  var geometry = new THREE.PlaneGeometry( 128, 128 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.FrontSide, map: texture} );
  var floor = new THREE.Mesh( geometry, material );
  floor.rotation.x = -1.57079633;
  scene.add( floor );

  floor.receiveShadow = true;


  //-----------------------------------------------------
  // create Ceiling
/*  var texture = new THREE.TextureLoader().load("http://localhost:8080/asset/texture?id=ceiling.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(32, 32);

  var geometry = new THREE.PlaneGeometry( 128, 128 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.FrontSide, map: texture} );
  var floor = new THREE.Mesh( geometry, material );
  floor.rotation.x = 1.57079633;
  floor.position.y = 4;
  scene.add( floor );

  floor.receiveShadow = true;*/

  //-----------------------------------------------------
  // create outer Walls
  for(var i = 0; i < 4; i++){
    var texture = new THREE.TextureLoader().load("http://localhost:8080/asset/texture?id=wall.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(64, 2);

    var geometry = new THREE.PlaneGeometry( 128, 4 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.FrontSide, map: texture} );
    var wall = new THREE.Mesh( geometry, material );
    if(i == 0)
      wall.position.z = -64;
    else if(i == 1)
      wall.position.x = -64;
    else if(i == 2)
      wall.position.z = 64;
    else if(i == 3)
      wall.position.x = 64;
    wall.position.y = 2;
    wall.rotation.y = 1.57079633 * i;
    scene.add( wall );

    wall.receiveShadow = true;
    wall.castShadow = true;
  }

  function getImageData( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );
  }

  function getPixel( imagedata, x, y ) {

      var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
      return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };

  }

  // load a texture, set wrap mode to repeat
  var texture = new THREE.TextureLoader().load("http://localhost:8080/asset/texture?id=wall.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);

  var geometry = new THREE.BoxGeometry(4, 4, 4);
  var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.FrontSide, map: texture} );

  var imagedata = getImageData(document.getElementById('map'));
  for(var y = 0; y < 32; y++){
    for(var x = 0; x < 32; x++){
      var color = getPixel( imagedata, x, y );
      if(color.r == 0){
        var wall = new THREE.Mesh( geometry, material );
        wall.position.set(x*4 - 62,2,y*4 - 62);
        scene.add( wall );
        wall.receiveShadow = true;
        wall.castShadow = true;
        //Add bounding boxes;
        boundingBoxes.push(new THREE.Box3().setFromObject(wall));
    /*  }else if(color.b == 0){
        // create a point light
        const pointLight = new THREE.PointLight(0xAAFFCC, 1, 20);
        //pointLight.castShadow = true;
        // set its position
        pointLight.position.set(x*4 - 60,2,y*4 - 60);
        // add to the scene
        scene.add(pointLight);*/
      }
    }
  }
}
