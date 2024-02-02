angular.module('beamng.apps')
.directive('radioTest', [function () {
  return {
    templateUrl: '/ui/modules/apps/RadioTest/app.html',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {

      // draft version for demo purposes

      function reset() {
        scope.play = () => {};
        scope.pause = () => {};
        scope.stop = () => {};
        scope.volume = () => {};
        scope.status = "...";
        scope.playing = false;
        scope.paused = false;
        scope.ready = false;
      }
      reset();

      const audio_ctx = new AudioContext({ latencyHint: "playback" });

      async function init_audio(url, scope) {
        function load_audio(url) {
          return new Promise(function (resolve, reject) {
            function load(data) {
              audio_ctx.decodeAudioData(data, function (buffer) {
                let audio = {
                  source: null,
                  gainer: null,
                  playing: false,
                  paused: false,
                  set volume(factor) {
                    if (audio.gainer)
                      audio.gainer.gain.value = factor;
                  },
                  get volume() {
                    return audio.gainer ? audio.gainer.gain.value : 1.0;
                  },
                  play: function (loop=false) {
                    try {
                      if (audio.playing) {
                        if (audio.paused)
                          audio.pause();
                        return;
                      }
                      // load
                      audio.source = audio_ctx.createBufferSource();
                      audio.source.buffer = buffer;
                      audio.gainer = audio_ctx.createGain();
                      audio.gainer.gain.value = 0.3; // default volume
                      audio.gainer.connect(audio_ctx.destination);
                      audio.source.connect(audio.gainer);
                      audio.source.connect(audio_ctx.destination);
                      audio.source.addEventListener("ended", () => audio.stop());
                      // start
                      audio.source.loop = loop;
                      audio.source.start(0);
                      scope.playing =
                        audio.playing = true;
                    } catch (err) {
                      console.log("Error starting audio", err);
                    }
                  },
                  pause: function () {
                    try {
                      if (!audio.playing)
                        return audio.play();
                      if (!audio.paused) {
                        audio.source.disconnect();
                        scope.paused =
                          audio.paused = true;
                      } else {
                        audio.source.connect(audio.gainer);
                        audio.source.connect(audio_ctx.destination);
                        scope.paused =
                          audio.paused = false;
                      }
                    } catch (err) {
                      console.log("Error pausing audio", err);
                    }
                  },
                  stop: function () {
                    if (!audio.playing)
                      return;
                    try {
                      audio.source.stop(0);
                      audio.source = null;
                      scope.playing =
                        audio.playing = false;
                      scope.paused =
                        audio.paused = false;
                    } catch (err) {
                      console.log("Error stopping audio", err);
                    }
                  }
                };
                resolve(audio);
              }, reject);
            }

            let xhr = new XMLHttpRequest();
            xhr.onload = function () {
              if (xhr.status === 200) {
                try {
                  load(xhr.response);
                } catch (err) {
                  reject(err);
                }
              } else {
                reject(xhr);
              }
            };
            xhr.responseType = "arraybuffer";
            xhr.open("GET", url, true);
            xhr.send();
          }); // promise
        }

        let audio;
        try {
          scope.stop();
          reset();
          scope.ready = false;
          scope.status = `Loading: ${url}`;
          audio = await load_audio(url);
          scope.status = `Loaded: ${url}`;
          scope.play = audio.play;
          scope.pause = audio.pause;
          scope.stop = audio.stop;
          scope.volume = vol => audio.volume = vol;
          scope.ready = true;
        } catch (err) {
          audio = null;
          scope.status = "Error :(";
          console.log("Error loading audio:", err);
        }
        return audio;
      }

      // this can be exposed to load other files
      init_audio("/art/sound/music/dicta.ogg", scope);

    }
  };
}]);
