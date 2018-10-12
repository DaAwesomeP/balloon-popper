/* public/js/sketch.js
 * Originally created 10/11/2018 by Perry Naseck (DaAwesomeP)
 * https://github.com/DaAwesomeP/balloon-popper
 *
 * Copyright 2018-present Perry Naseck (DaAwesomeP)
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

import colors from '../data/colorsHex'

var clock = new THREE.Clock()

var camera, controls, scene, renderer
var mixer, skeletonHelper

init()
animate()

var loader = new THREE.BVHLoader()
loader.load('bvh/fighting-31-syotei-yokoyama.bvh', result => {
  skeletonHelper = new THREE.SkeletonHelper(result.skeleton.bones[0])
  skeletonHelper.material.linewidth = 10
  skeletonHelper.skeleton = result.skeleton // allow animation mixer to bind to SkeletonHelper directly

  var boneContainer = new THREE.Group()
  boneContainer.add(result.skeleton.bones[0])

  scene.add(skeletonHelper)
  scene.add(boneContainer)

  // play animation
  mixer = new THREE.AnimationMixer(skeletonHelper)
  mixer.clipAction(result.clip).setEffectiveWeight(1.0).play()
})

// create an AudioListener and add it to the camera
var listener = new THREE.AudioListener()
camera.add(listener)

// create a global audio source
var sound = new THREE.Audio(listener)

// load a sound and set it as the Audio object's buffer
var audioLoader = new THREE.AudioLoader()
audioLoader.load('audio/Balloon Popping-SoundBible.com-1247261379.wav', buffer => {
  sound.setBuffer(buffer)
  sound.setLoop(false)
  sound.setVolume(1)
})

var ambientLight = new THREE.AmbientLight(0x000000)
scene.add(ambientLight)

var lights = []
lights[0] = new THREE.PointLight(0xffffff, 1, 0)
lights[1] = new THREE.PointLight(0xffffff, 1, 0)
lights[2] = new THREE.PointLight(0xffffff, 1, 0)

lights[0].position.set(0, 2000, 0)
lights[1].position.set(1000, 2000, 0)
lights[2].position.set(-1000, -2000, 0)

scene.add(lights[0])
scene.add(lights[1])
scene.add(lights[2])

let newBalloon = (r, color, x, y, z, o) => {
  var geometry = new THREE.SphereGeometry(r, 32, 32)
  var material = new THREE.MeshStandardMaterial({
    color: color,
    wireframe: false,
    transparent: true,
    opacity: o
  })
  var sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(x, y, z)
  return sphere
}

let newBalloonGrid = (r, i, s, o) => {
  let balloons = []
  let pad = (r * 2) + s
  let c = ((i - 1) * pad) / 2
  for (let x of Array(i).keys()) {
    for (let y of Array(i - 4).keys()) {
      for (let z of Array(i - 2).keys()) {
        let color = colors[Math.floor(Math.random() * colors.length)]
        let bx = x * pad - c + 100
        let by = y * pad + r
        let bz = z * pad - c + 250
        let balloon = newBalloon(r, color, bx, by, bz, o)
        scene.add(balloon)
        balloons.push({
          pos: {
            x: bx,
            y: by,
            z: bz
          },
          r: r,
          o: o,
          color: color,
          mesh: balloon
        })
      }
    }
  }
  return balloons
}
let balloons = newBalloonGrid(20, 10, 5, 1)

function init () {
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(0, 450, -400)

  controls = new THREE.OrbitControls(camera)
  controls.minDistance = 300
  controls.maxDistance = 700

  scene = new THREE.Scene()

  scene.add(new THREE.GridHelper(200, 10))

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setClearColor(0xeeeeee)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

var set = false
function animate () {
  // if (!isPlay) return
  window.requestAnimationFrame(animate)

  var delta = clock.getDelta()

  if (mixer) mixer.update(delta)
  // if (skeletonHelper) skeletonHelper.update()

  renderer.render(scene, camera)

  if (skeletonHelper) {
    if (!set) {
      console.log(skeletonHelper.skeleton.bones)
      set = true
    }
    if (skeletonHelper.skeleton) {
      for (let bone of skeletonHelper.skeleton.bones) {
        if (bone.name !== 'ENDSITE') {
          for (let balloon of balloons) {
            // console.log(skeletonHelper.skeleton.bones)
            let ballPos = balloon.pos
            let bonePos = bone.position
            let dist = Math.sqrt(Math.pow(ballPos.x - bonePos.x, 2) + Math.pow(ballPos.y - bonePos.y, 2) + Math.pow(ballPos.z - bonePos.z, 2))
            // console.log({ dist, ballPos, bonePos, name: bone.name })
            if (dist <= balloon.r * 4 && balloon.mesh.material.opacity !== 0) {
              console.log('KILL BALLOON')
              // console.log({ dist, ballPos, bonePos, name: bone.name })
              // scene.remove(balloon.mesh)
              if (balloon.mesh.material.opacity !== 0) {
                if (sound.isPlaying) sound.stop()
                sound.play()
              }
              balloon.mesh.material.opacity = 0
              // balloons.splice(balloons.indexOf(balloon))
              // scene.add(newBalloon(balloon.r, balloon.color, ballPos.x, ballPos.y, ballPos.z, balloon.o))
            }
          }
        }
      }
    }
  }
}
