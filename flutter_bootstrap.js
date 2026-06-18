(function () {
  var flutterScript = document.createElement('script');
  flutterScript.src = 'flutter.js';
  flutterScript.async = false;
  flutterScript.onerror = function () {
    if (window.fitControlStartupError) {
      window.fitControlStartupError('O carregador flutter.js não foi encontrado.');
    }
  };
  flutterScript.onload = function () {
    if (!window._flutter) {
      window._flutter = {};
    }
    window._flutter.buildConfig = {
      engineRevision: 'c416acfeb8126e097f758c664aaa3da929e27da0',
      builds: [
        {
          compileTarget: 'dart2js',
          renderer: 'canvaskit',
          mainJsPath: 'main.dart.js'
        }
      ]
    };
    window._flutter.loader.load().catch(function (error) {
      console.error('Falha ao iniciar o Flutter Web:', error);
      if (window.fitControlStartupError) {
        window.fitControlStartupError(
          'O Flutter Web foi carregado, mas não conseguiu iniciar: ' +
              (error && error.message ? error.message : String(error))
        );
      }
    });
  };
  document.head.appendChild(flutterScript);
}());
