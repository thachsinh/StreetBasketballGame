var EVENTS = {
  _click: function(e) {
      window.addEventListener("click", e.throwBall), window.addEventListener("click", function() {
          var t = e.world.getRenderer().domElement;
          !t.fullscreenElement && e.isMobile && (t.webkitRequestFullscreen && t.webkitRequestFullscreen(), t.mozRequestFullscreen && t.mozRequestFullscreen(), t.msRequestFullscreen && t.msRequestFullscreen(), t.requestFullscreen && t.requestFullscreen())
      })
  },
  _move: function(e) {
      ["mousemove", "touchmove"].forEach(function(t) {
          window.addEventListener(t, e.updateCoords)
      })
  },
  _keypress: function(e) {
      window.addEventListener("keypress", e.checkKeys)
  },
  _resize: function(e) {
      e.cursor.xCenter = window.innerWidth / 2, e.cursor.yCenter = window.innerHeight / 2, window.addEventListener("resize", function() {
          var e = document.querySelector(".whs canvas").style;
          e.width = "100%", e.height = "100%"
      })
  }
},
keep_ball = function(e) {
  return new WHS.Loop(function() {
      e.thrown || e.keepBall();
      var t = e.ball.position,
          o = e.basket.position;
      t.distanceTo(o) < e.basketGoalDiff && Math.abs(t.y - o.y + e.basketYDeep()) < e.basketYGoalDiff() && !e.goal && e.onGoal(t, o)
  })
},
APP = {
  helpersActive: !0,
  bgColor: 13421772,
  ballRadius: 6,
  basketColor: 16711680,
  getBasketRadius: function() {
      return APP.ballRadius + 2
  },
  basketTubeRadius: .5,
  basketY: 20,
  basketDistance: 80,
  getBasketZ: function() {
      return APP.getBasketRadius() + 2 * APP.basketTubeRadius - APP.basketDistance
  },
  basketGoalDiff: 2.5,
  basketYGoalDiff: function() {
      return APP.isMobile ? 2 : 1
  },
  basketYDeep: function() {
      return APP.isMobile ? 2 : 1
  },
  goalDuration: 1800,
  doubleTapTime: 300,
  thrown: !1,
  doubletap: !1,
  goal: !1,
  controlsEnabled: !0,
  isMobile: navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/),
  cursor: {
      x: 0,
      y: 0,
      xCenter: window.innerWidth / 2,
      yCenter: window.innerHeight / 2
  },
  force: {
      y: 6,
      z: -2,
      m: 2400,
      xk: 8
  },
  init: function() {
      APP.world = new WHS.World({
          autoresize: "window",
          softbody: !0,
          background: {
              color: APP.bgColor
          },
          fog: {
              type: "regular",
              hex: 16777215
          },
          camera: {
              z: 50,
              y: APP.basketY,
              aspect: 45
          },
          physics: {
              fixedTimeStep: !!APP.isMobile && 1 / 35
          },
          gravity: {
              y: -200
          }
      }), APP.camera = APP.world.getCamera(), APP.camera.lookAt(new THREE.Vector3(0, APP.basketY, 0)), APP.ProgressLoader = new ProgressLoader(APP.isMobile ? 12 : 14), APP.createScene(), APP.addLights(), APP.addBasket(), APP.addBall(), APP.initEvents(), APP.keep_ball = keep_ball(APP), APP.world.addLoop(APP.keep_ball), APP.keep_ball.start(), APP.world.start()
  },
  createScene: function() {
      APP.ground = new WHS.Plane({
          geometry: {
              buffer: !0,
              width: 1e3,
              height: 800
          },
          mass: 0,
          material: {
              kind: "phong",
              color: APP.bgColor
          },
          pos: {
              y: -20,
              z: 120
          },
          rot: {
              x: -Math.PI / 2
          }
      }), APP.ground.addTo(APP.world).then(function() {
          return APP.ProgressLoader.step()
      }), APP.wall = APP.ground.clone(), APP.wall.position.y = 180, APP.wall.position.z = -APP.basketDistance, APP.wall.rotation.x = 0, APP.wall.addTo(APP.world).then(function() {
          return APP.ProgressLoader.step()
      }), APP.planeForRaycasting = new THREE.Plane(new THREE.Vector3(0, 1, 0), -APP.ground.position.y - APP.ballRadius)
  },
  addLights: function() {
      new WHS.PointLight({
          light: {
              distance: 100,
              intensity: 1,
              angle: Math.PI
          },
          shadowmap: {
              width: 1024,
              height: 1024,
              left: -50,
              right: 50,
              top: 50,
              bottom: -50,
              far: 80,
              fov: 90
          },
          pos: {
              y: 60,
              z: -40
          }
      }).addTo(APP.world).then(function() {
          return APP.ProgressLoader.step()
      }), new WHS.AmbientLight({
          light: {
              intensity: .3
          }
      }).addTo(APP.world).then(function() {
          return APP.ProgressLoader.step()
      })
  },
  addBasket: function() {
      APP.backboard = new WHS.Box({
          geometry: {
              buffer: !0,
              width: 41,
              depth: 1,
              height: 28
          },
          mass: 0,
          material: {
              kind: "standard",
              map: WHS.texture("textures/backboard/1/backboard.jpg"),
              normalMap: WHS.texture("textures/backboard/1/backboard_normal.jpg"),
              displacementMap: WHS.texture("textures/backboard/1/backboard_displacement.jpg"),
              normalScale: new THREE.Vector2(.3, .3),
              metalness: 0,
              roughness: .3
          },
          pos: {
              y: APP.basketY + 10,
              z: APP.getBasketZ() - APP.getBasketRadius()
          }
      }), APP.backboard.addTo(APP.world).then(function() {
          return APP.ProgressLoader.step()
      }), APP.basket = new WHS.Torus({
          geometry: {
              buffer: !0,
              radius: APP.getBasketRadius(),
              tube: APP.basketTubeRadius,
              radialSegments: APP.isMobile ? 6 : 8,
              tubularSegments: 16
          },
          shadow: {
              cast: !1
          },
          mass: 0,
          material: {
              kind: "standard",
              color: APP.basketColor,
              metalness: .8,
              roughness: .5,
              emissive: 16764159,
              emissiveIntensity: .2
          },
          pos: {
              y: APP.basketY,
              z: APP.getBasketZ()
          },
          physics: {
              type: "concave"
          },
          rot: {
              x: Math.PI / 2
          }
      }), APP.basket.addTo(APP.world).then(function() {
          return APP.ProgressLoader.step()
      }), APP.net = new WHS.Cylinder({
          geometry: {
              radiusTop: APP.getBasketRadius(),
              radiusBottom: APP.getBasketRadius() - 3,
              height: 15,
              openEnded: !0,
              heightSegments: APP.isMobile ? 2 : 3,
              radiusSegments: APP.isMobile ? 8 : 16
          },
          shadow: {
              cast: !1
          },
          physics: {
              pressure: 2e3,
              friction: .02,
              margin: .5,
              anchorHardness: .5,
              viterations: 2,
              piterations: 2,
              diterations: 4,
              citerations: 0
          },
          mass: 30,
          softbody: !0,
          material: {
              map: WHS.texture("textures/net4.png", {
                  repeat: {
                      y: .7,
                      x: 2
                  },
                  offset: {
                      y: .3
                  }
              }),
              transparent: !0,
              opacity: .7,
              kind: "basic",
              side: THREE.DoubleSide,
              depthWrite: !1
          },
          pos: {
              y: APP.basketY - 8,
              z: APP.getBasketZ()
          }
      }), APP.net.addTo(APP.world).then(function() {
          APP.net.getNative().frustumCulled = !1;
          for (var e = APP.isMobile ? 8 : 16, t = 0; t < e; t++) APP.net.appendAnchor(APP.world, APP.basket, t, .8, !0);
          APP.ProgressLoader.step()
      })
  },
  addBall: function() {
      APP.ball = new WHS.Sphere({
          geometry: {
              buffer: !0,
              radius: APP.ballRadius,
              widthSegments: APP.isMobile ? 16 : 32,
              heightSegments: APP.isMobile ? 16 : 32
          },
          mass: 120,
          material: {
              kind: "phong",
              map: WHS.texture("textures/ball.png"),
              normalMap: WHS.texture("textures/ball_normal.png"),
              shininess: 20,
              reflectivity: 2,
              normalScale: new THREE.Vector2(.5, .5)
          },
          physics: {
              restitution: 3
          }
      }), APP.ball.addTo(APP.world).then(function() {
          return APP.ProgressLoader.step()
      })
  },
  initEvents: function() {
      EVENTS._move(APP), EVENTS._click(APP), EVENTS._keypress(APP), EVENTS._resize(APP), APP.ProgressLoader.step()
  },
  updateCoords: function(e) {
      e.preventDefault(), APP.cursor.x = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX, APP.cursor.y = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY
  },
  checkKeys: function(e) {
      e.preventDefault(), "Space" === e.code && (APP.thrown = !1)
  },
  detectDoubleTap: function() {
      return APP.doubletap ? (APP.thrown = !1, APP.doubletap = !0, !0) : (APP.doubletap = !0, setTimeout(function() {
          APP.doubletap = !1
      }, APP.doubleTapTime), !1)
  },
  throwBall: function(e) {
      if (e.preventDefault(), !APP.detectDoubleTap() && APP.controlsEnabled && !APP.thrown) {
          var t = new THREE.Vector3(APP.force.xk * (APP.cursor.x - APP.cursor.xCenter), APP.force.y * APP.force.m, APP.force.z * APP.force.m);
          APP.ball.setLinearVelocity(new THREE.Vector3(0, 0, 0)), APP.ball.applyCentralImpulse(t), t.multiplyScalar(10 / APP.force.m), t.y = t.x, t.x = APP.force.y, t.z = 0, APP.ball.setAngularVelocity(t), APP.thrown = !0, APP.menu.attempts++
      }
  },
  keepBall: function() {
      var e = APP.cursor,
          t = (e.x - e.xCenter) / window.innerWidth * 32,
          o = -(e.y - e.yCenter) / window.innerHeight * 32;
      APP.ball.position.set(t, o, -36)
  }
};
basket.require({
url: "bower_components/whitestorm/build/whitestorm.js"
}).then(function() {
APP.init()
});