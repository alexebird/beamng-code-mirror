<template>
    <svg ref="svg" class="svg-app" viewBox="-20 -50 300 527" :style="{'opacity': appState.isAppDisplayed ? 1 : 0}">
        <g transform="translate(-13.701535,-283.48656)" style="display:inline;" id="carGroup">
            <path ref="tireFL"
                d="m 40.219516,385.93366 0.0893,-35.49107 c 0,0 0.44642,-5.22322 5.08928,-5.22322 4.64286,0 22.41072,-0.13394 22.41072,-0.13394 0,0 5.44643,-10e-6 5.49107,5.22321 0.0534,6.25041 -0.0447,34.64286 -0.0447,34.64286 l 0.0893,36.25 c 0,0 -0.0446,5.35714 -5.53571,5.44643 -3.12586,0.0508 -21.47322,-10e-6 -21.47322,-10e-6 0,0 -5.98214,10e-6 -6.02678,-5.3125 -0.0375,-4.46412 -0.0893,-35.40178 -0.0893,-35.40178 z"
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
            <path
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                d="m 212.19799,385.43366 0.0893,-35.49107 c 0,0 0.44642,-5.22322 5.08928,-5.22322 4.64286,0 22.41072,-0.13394 22.41072,-0.13394 0,0 5.44643,-10e-6 5.49107,5.22321 0.0534,6.25041 -0.0447,34.64286 -0.0447,34.64286 l 0.0893,36.25 c 0,0 -0.0446,5.35714 -5.53571,5.44643 -3.12586,0.0508 -21.47322,-10e-6 -21.47322,-10e-6 0,0 -5.98214,10e-6 -6.02678,-5.3125 -0.0375,-4.46412 -0.0893,-35.40178 -0.0893,-35.40178 z"
                ref="tireFR" />
            <path ref="tireRR"
                d="m 212.19799,654.14795 0.0893,-35.49107 c 0,0 0.44642,-5.22322 5.08928,-5.22322 4.64286,0 22.41072,-0.13394 22.41072,-0.13394 0,0 5.44643,-10e-6 5.49107,5.22321 0.0534,6.25041 -0.0447,34.64286 -0.0447,34.64286 l 0.0893,36.25 c 0,0 -0.0446,5.35714 -5.53571,5.44643 -3.12586,0.0508 -21.47322,-10e-6 -21.47322,-10e-6 0,0 -5.98214,10e-6 -6.02678,-5.3125 -0.0375,-4.46412 -0.0893,-35.40178 -0.0893,-35.40178 z"
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
            <path
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                d="m 40.219516,654.14795 0.0893,-35.49107 c 0,0 0.44642,-5.22322 5.08928,-5.22322 4.64286,0 22.41072,-0.13394 22.41072,-0.13394 0,0 5.44643,-10e-6 5.49107,5.22321 0.0534,6.25041 -0.0447,34.64286 -0.0447,34.64286 l 0.0893,36.25 c 0,0 -0.0446,5.35714 -5.53571,5.44643 -3.12586,0.0508 -21.47322,-10e-6 -21.47322,-10e-6 0,0 -5.98214,10e-6 -6.02678,-5.3125 -0.0375,-4.46412 -0.0893,-35.40178 -0.0893,-35.40178 z"
                ref="tireRL" />
            <path ref="bodyFL"
                d="m 139.30351,268.73244 c 0,0 -20.06962,-0.0115 -32.7295,1.35397 -11.849388,1.27802 -23.33457,5.11217 -35.698872,11.89174 -11.963689,6.55991 -22.259598,16.59274 -27.506842,31.58729 -3.060137,8.74465 -3.902495,25.39725 -3.902495,25.39725 l 9.609942,-0.14814 c 0,0 1.636978,-16.52695 5.208997,-24.93149 3.978738,-9.3615 11.635356,-19.52025 21.213285,-24.53523 10.627835,-5.56471 18.689453,-8.01564 32.759185,-10.2291 11.61143,-1.82671 31.13813,-1.14019 31.13813,-1.14019 z"
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
            <path ref="bodyML"
                d="m 46.365238,434.85859 c 0,0 -4.37766,0.0905 -6.56641,0.125 -0.0234,2.215 -0.08,17.90873 -0.125,26.86328 0,0 -20.45068,7.80958 -22.22461,10.85938 -1.79329,3.0831 -4.63644,8.09161 -2.46289,8.46094 0,0 25.14091,-3.55661 25.60352,-3.40821 0.0618,2.25563 -0.62153,126.52252 -0.59375,127.77539 1.21285,-0.002 9.6289,0.0312 9.6289,0.0312 l -0.01,-170.70703 z"
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
            <path ref="bodyMR"
                d="m 236.6054,434.90159 -0.0117,170.70899 c 0,0 7.91605,-0.0352 9.1289,-0.0332 0.0278,-1.25287 -0.65555,-125.51976 -0.59375,-127.77539 0.46261,-0.1484 25.60352,3.40821 25.60352,3.40821 2.17355,-0.36933 -0.6696,-5.37589 -2.46289,-8.45899 -1.77393,-3.0498 -22.22266,-10.85937 -22.22266,-10.85937 -0.045,-8.95456 -0.10355,-24.64828 -0.12695,-26.86328 -2.18875,-0.0345 -9.31447,-0.12697 -9.31447,-0.12697 z"
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
            <path ref="driveShaft"
                d="m 146.88019,519.13977 0.34682,-126.1992 c 0,0 14.81582,-18.06715 -4.26439,-17.94569 -19.92,0.12681 -4.95719,17.95354 -4.95719,17.95354 l 0.0408,126.25385 c -0.48292,33.8145 0.52349,126.53492 0.52349,126.53492 -3.70809,6.93305 -6.96405,16.59296 4.6368,16.4848 11.45601,-0.10682 8.66714,-8.10662 4.65438,-16.55312 -1.97544,-4.15814 -0.98066,-126.5291 -0.98066,-126.5291 z"
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:0.99999976;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
            <path ref="engine"
                d="m 122.07373,314.95322 h 33.63152 v 5.9272 h -13.25677 v 5.34505 h 12.93926 l 6.08594,9.31416 h 5.37155 v 4.97461 h 6.00656 v -5.05399 h 8.22927 c 0,0 2.66605,2.98563 3.2282,4.8423 1.71505,5.66443 1.56492,12.04739 0,17.75512 -0.61276,2.23494 -3.54572,5.98011 -3.54572,5.98011 h -7.93821 v -5.39797 h -6.29763 v 11.32517 h -34.98103 l -6.50934,-7.93822 H 113.0771 v -16.51145 h -5.98011 v 15.87643 h -5.1863 v -28.89508 h 4.97462 v 7.62066 h 6.29764 v -7.72651 h 8.99664 v -5.98013 h 14.12999 v -6.19179 h -14.23585 z"
                style="display:inline;fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000012;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
            <path
                d="m 117.17264,721.33809 -7.7414,-9.05075 c 0,0 -1.6874,1.50785 -2.481,2.29715 -0.685,0.6814 -1.3051,1.5911 0.2757,3.6525 0.5444,0.7098 3.2227,3.9338 3.7903,4.5024 1.6325,1.6355 2.5754,1.6201 3.3309,1.0108 0.9517,-0.7675 2.8255,-2.4121 2.8255,-2.4121 z m -5.4902,-9.02777 c -0.2639,-0.33031 -0.3782,-0.42184 0.023,-0.78103 0.2875,-0.31046 1.9506,-1.87788 2.2512,-2.13637 0.2218,-0.19078 0.3561,-0.42492 0.1149,-0.7236 -0.2412,-0.33308 -2.1908,-2.68012 -2.4982,-3.06097 -0.2198,-0.27232 -0.2732,-0.32108 -0.2732,-0.50554 0,-0.75917 0.011,-34.43177 0.015,-35.00437 0,-0.2149 0.056,-0.3086 0.5162,-0.3086 h 51.67845 c 2.0683,0 3.0251,0.3486 4.3679,1.4435 1.1871,0.9678 2.1659,2.0917 2.17,4.6095 0,0 0.065,37.07605 0.065,38.41705 0,1.2398 -0.1967,4.1364 -1.6325,5.5294 -1.0614,1.0299 -3.8532,1.8924 -4.9438,1.8924 -1.5414,0 -37.80368,-0.016 -38.25553,-0.016 -0.32906,0 -0.70707,-0.079 -0.93514,-0.3163 -0.27185,-0.2826 -2.9151,-3.0777 -3.22317,-3.371 -0.15862,-0.151 -0.25989,-0.4548 -0.64972,-0.097 -0.3899,0.3574 -1.73649,1.4573 -2.04669,1.7218 -0.1403,0.1197 -0.2841,0.2357 -0.5523,-0.032 -0.4136,-0.4769 -5.8261,-6.80285 -6.191,-7.25968 z m 20.26835,-10.96158 c -0.003,-4.55255 -0.0326,-8.19817 0,-12.74562 0,-0.7695 -0.32724,-0.97794 -1.30987,-1.85445 -0.76302,-0.68063 -1.41614,-1.23286 -1.90915,-1.69336 -0.36587,-0.34178 -0.85706,-0.80537 -0.84008,-1.1791 0.0258,-0.56967 0.59396,-1.0422 0.93428,-1.21472 0.54578,-0.27667 0.94727,-0.0528 1.23375,0.23366 0.30382,0.30381 1.84818,1.77993 2.58906,2.39496 0.44759,0.37156 0.58562,0.67733 1.67741,0.67733 5.46749,-0.0217 12.23023,-0.18415 18.32732,0 1.09189,0 1.22992,-0.30577 1.67737,-0.67733 0.74089,-0.61503 2.28521,-2.09115 2.58911,-2.39496 0.2865,-0.28643 0.688,-0.51033 1.2338,-0.23366 0.3404,0.17252 0.9085,0.64505 0.9344,1.21472 0.017,0.37373 -0.4743,0.83732 -0.8402,1.1791 -0.493,0.4605 -1.1461,1.01273 -1.909,1.69336 -0.98279,0.87651 -1.30997,1.08495 -1.30997,1.85445 0,4.55255 0.0323,8.19817 0,12.74562 0,0.76951 0.32718,0.97793 1.30997,1.85447 0.7629,0.68062 1.416,1.23285 1.909,1.69335 0.3659,0.34177 0.857,0.80537 0.8402,1.1791 -0.026,0.56967 -0.594,1.04219 -0.9344,1.21472 -0.5458,0.27667 -0.9473,0.0528 -1.2338,-0.23366 -0.3039,-0.30382 -1.84822,-1.77992 -2.58911,-2.39497 -0.44745,-0.37154 -0.58548,-0.67731 -1.67737,-0.67731 -6.55155,0.019 -11.82218,0.18501 -18.32732,0 -1.09179,0 -1.22982,0.30577 -1.67741,0.67731 -0.74088,0.61505 -2.28524,2.09115 -2.58906,2.39497 -0.28648,0.28644 -0.68797,0.51033 -1.23375,0.23366 -0.34032,-0.17253 -0.90842,-0.64505 -0.93428,-1.21472 -0.017,-0.37373 0.47421,-0.83733 0.84008,-1.1791 0.49301,-0.4605 1.14613,-1.01273 1.90915,-1.69335 0.98263,-0.87654 1.30987,-1.08496 1.30987,-1.85447 z m 2.56799,-10.35082 c 0,2.40538 0,5.36454 0,8.01339 0,0.63296 -0.0236,1.4238 0.45482,1.90048 0.45132,0.44967 1.08277,0.42233 1.81926,0.42233 h 13.2426 c 0.7365,0 1.36798,0.0273 1.81926,-0.42233 0.47837,-0.47668 0.45477,-1.26752 0.45477,-1.90048 v -3.94714 c 0,-1.35542 0,-2.71084 0,-4.06625 0,-0.63296 0.0233,-1.42381 -0.45477,-1.90047 -0.45128,-0.44969 -1.08276,-0.42234 -1.81926,-0.42234 h -13.2426 c -0.73649,0 -1.36794,-0.0273 -1.81926,0.42234 -0.47842,0.47666 -0.45482,1.26751 -0.45482,1.90047 z"
                style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000012;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                ref="fueltank" />
            <path
                d="m 162.19586,303.74311 v 1.62868 c 0,0 -0.0239,0.60243 0.40384,0.86252 0.36641,0.22282 3.17759,0.31545 3.59707,-0.042 0.34847,-0.29691 0.34658,-0.78069 0.34658,-0.78069 v -4.32093 c 0,0 -0.004,-0.63642 -0.53018,-0.91858 -0.27049,-0.14492 -2.81926,2.15048 -3.22871,2.49847 -0.49791,0.42318 -0.5886,0.94557 -0.5886,0.94557 z m -8.74296,-2.37979 v 4.00847 c 0,0 -0.0239,0.60243 0.40383,0.86252 0.36641,0.22282 3.17759,0.31545 3.59708,-0.042 0.34846,-0.29691 0.34657,-0.78069 0.34657,-0.78069 v -3.43014 c 0,0 -0.004,-0.63642 -0.53018,-0.91857 -0.27049,-0.14493 -2.94617,-0.75348 -3.2287,-0.64521 -0.61019,0.23381 -0.5886,0.94557 -0.5886,0.94557 z m -8.57375,1.15667 v 2.8518 c 0,0 -0.0239,0.60243 0.40383,0.86252 0.36641,0.22282 3.17759,0.31545 3.59708,-0.042 0.34846,-0.29691 0.34657,-0.78069 0.34657,-0.78069 v -3.78911 c 0,0 -0.002,-0.37799 -0.24416,-0.68051 -0.072,-0.09 -0.16527,-0.17335 -0.28602,-0.23806 -0.27049,-0.14492 -2.94617,0.76217 -3.2287,0.87043 -0.61019,0.23381 -0.5886,0.94557 -0.5886,0.94557 z m -8.63016,2.23357 v 0.61823 c 0,0 -0.0239,0.60243 0.40383,0.86252 0.36642,0.22282 3.17759,0.31545 3.59707,-0.042 0.34847,-0.29691 0.34658,-0.78069 0.34658,-0.78069 v -1.35611 c 0,0 -0.004,-0.63641 -0.53017,-0.91857 -0.2705,-0.14492 -2.94617,0.56274 -3.22871,0.671 -0.61019,0.23381 -0.5886,0.94557 -0.5886,0.94557 z m -8.50835,1.48075 c 0.36641,0.22282 3.17758,0.31545 3.59707,-0.042 0.34847,-0.29691 0.34658,-0.50066 0.34658,-0.50066 0,0 -0.004,-1.03528 -0.53018,-1.31744 -0.27049,-0.14492 -2.94617,-0.0851 -3.22871,0.0232 -0.61018,0.23381 -0.5886,1.10014 -0.5886,1.10014 0,0 -0.0239,0.47668 0.40384,0.73676 z m -9.0904,-2.1588 v 1.29628 c 0,0 -0.0239,0.60243 0.40383,0.86252 0.36642,0.22282 3.17759,0.31545 3.59707,-0.042 0.34847,-0.29691 0.34658,-0.78069 0.34658,-0.78069 v -0.5584 c 0,0 -0.004,-0.63642 -0.53017,-0.91858 -0.2705,-0.14492 -2.94617,-0.91301 -3.22871,-0.80474 -0.61019,0.23381 -0.5886,0.94556 -0.5886,0.94556 z m 52.345,1.37742 v -16.61221 c 0,0 -0.0239,-0.60242 0.40383,-0.86252 0.36642,-0.22281 3.17759,-0.31544 3.59707,0.042 0.34847,0.29692 0.34658,0.78069 0.34658,0.78069 v 16.63216 c 0,0 -0.004,0.63642 -0.53017,0.91857 -0.2705,0.14493 -2.94617,0.1552 -3.22871,0.0469 -0.61019,-0.23381 -0.5886,-0.94556 -0.5886,-0.94556 z m -8.79938,-16.61221 c 0,0 -0.0239,-0.60242 0.40384,-0.86252 0.36641,-0.22281 3.17759,-0.31544 3.59707,0.042 0.34847,0.29692 0.34658,0.78069 0.34658,0.78069 v 3.32029 c 0,0 -0.004,0.63641 -0.53018,0.91857 -0.27049,0.14492 -2.60773,-2.10106 -3.22871,-2.63237 -0.4965,-0.42482 -0.5886,-0.97378 -0.5886,-0.97378 z m -8.74296,0 c 0,0 -0.0239,-0.60242 0.40383,-0.86252 0.36641,-0.22281 3.17759,-0.31544 3.59708,0.042 0.34846,0.29692 0.34657,0.78069 0.34657,0.78069 v 1.74529 c 0,0 -0.004,0.63642 -0.53018,0.91857 -0.27049,0.14493 -2.94617,-0.12683 -3.2287,-0.2351 -0.61019,-0.23381 -0.5886,-0.77636 -0.5886,-0.77636 z m -8.57375,0 c 0,0 -0.0239,-0.60242 0.40383,-0.86252 0.36641,-0.22281 3.17759,-0.31544 3.59708,0.042 0.34846,0.29692 0.34657,0.78069 0.34657,0.78069 v 1.80688 c 0,0 -0.002,0.378 -0.24416,0.68052 -0.072,0.09 -0.16527,0.17335 -0.28602,0.23805 -0.27049,0.14493 -2.94617,1.1141 -3.2287,1.00584 -0.61019,-0.23381 -0.5886,-0.81866 -0.5886,-0.81866 z m -8.63016,0 c 0,0 -0.0239,-0.60242 0.40383,-0.86252 0.36642,-0.22281 3.17759,-0.31544 3.59707,0.042 0.34847,0.29692 0.34658,0.78069 0.34658,0.78069 v 4.46516 c 0,0 -0.004,0.63641 -0.53017,0.91857 -0.2705,0.14493 -2.94617,0.97309 -3.22871,0.86482 -0.61019,-0.23381 -0.6027,-0.81866 -0.6027,-0.81866 z m -8.91219,0 c 0,0 -0.0239,-0.60242 0.40384,-0.86252 0.36641,-0.22281 3.17758,-0.31544 3.59707,0.042 0.34847,0.29692 0.34658,0.78069 0.34658,0.78069 v 6.04004 c 0,0 -0.004,0.63641 -0.53018,0.91857 -0.27049,0.14493 -2.94617,-0.0986 -3.22871,-0.2069 -0.61018,-0.23381 -0.5886,-0.90327 -0.5886,-0.90327 z m -8.68656,4.20791 v -4.20791 c 0,0 -0.0239,-0.60242 0.40383,-0.86252 0.36642,-0.22281 3.17759,-0.31544 3.59707,0.042 0.34847,0.29692 0.34658,0.78069 0.34658,0.78069 v 4.90473 c 0,0 -0.004,0.63641 -0.53017,0.91857 -0.2705,0.14492 -2.94617,-0.52168 -3.22871,-0.62994 -0.61019,-0.23382 -0.5886,-0.94557 -0.5886,-0.94557 z m 0.0383,3.38266 0.0424,3.80682 c 4.76147,1.58463 12.44208,1.37115 18.62715,0.76876 4.9084,-0.47805 9.46499,-3.13968 14.38678,-3.45098 2.56844,-0.16246 7.67481,0.84058 7.67481,0.84058 l 0.018,4.52569 c 0,0 4.30181,-3.85868 6.85434,-6.08209 0.23182,-0.21672 0.26026,-0.28202 -0.0588,-0.61036 -2.4793,-2.37833 -6.8878,-6.08125 -6.8878,-6.08125 l 0.0141,4.90206 c 0,0 -5.19129,-1.89571 -12.24908,-0.16859 -3.96245,1.32729 -6.76872,2.21825 -10.27188,2.769 -2.7191,0.42749 -5.4997,0.55723 -8.24775,0.4009 -3.33921,-0.18995 -6.69491,-0.50286 -9.90211,-1.62054 z m -15.25121,10.1713 c 0,0.39543 -0.18036,1.62226 1.45209,3.25472 1.40638,1.19302 2.9727,1.1712 3.41028,1.1712 23.19944,0.0992 44.97243,0.0226 68.7019,0 0.43758,0 2.0039,0.0218 3.41029,-1.1712 1.63245,-1.63246 1.45208,-2.85929 1.45208,-3.25472 0.12422,-16.06162 0.0264,-3.05893 0,-19.25937 0,-0.39543 0.18037,-1.62225 -1.45208,-3.25471 -1.40639,-1.19302 -2.97271,-1.1712 -3.41029,-1.1712 -23.19944,-0.0992 -44.97243,-0.0226 -68.7019,0 -0.43758,0 -2.0039,-0.0218 -3.41028,1.1712 -1.63245,1.63246 -1.45209,2.85928 -1.45209,3.25471 -0.11802,17.21566 -0.0338,3.97954 0,19.25937 z m 1.90997,-17.51991 c 0,-0.36657 -0.12323,-2.09175 1.14118,-3.35617 1.05214,-0.89259 3.06543,-0.74668 3.48144,-0.74668 22.55947,-0.021 43.30609,-0.0919 65.36168,0 1.3185,0 2.52269,-0.19776 3.66518,0.74727 1.05732,1.05732 0.95743,2.19932 0.95743,3.35558 0.0252,15.01782 0.11812,0.8913 0,15.78046 0,1.5229 -0.0428,2.46913 -0.90102,3.32738 -1.06456,0.88061 -2.31847,0.77547 -3.72159,0.77547 -22.55947,0.021 -43.30609,0.0919 -65.36168,0 -1.7721,0 -2.45712,0.11664 -3.44156,-0.68686 -1.36393,-1.36393 -1.18106,-1.95258 -1.18106,-3.41599 0.12429,-15.20955 -0.092,-2.68107 0,-15.78046 z m 4.56001,16.37025 v -16.61221 c 0,0 -0.0239,-0.60242 0.40383,-0.86252 0.36641,-0.22281 3.1776,-0.31544 3.59708,0.042 0.34846,0.29692 0.34658,0.78069 0.34658,0.78069 v 16.63216 c 0,0 -0.004,0.63642 -0.53019,0.91857 -0.27048,0.14493 -2.94617,0.1552 -3.2287,0.0469 -0.61019,-0.23381 -0.5886,-0.94556 -0.5886,-0.94556 z"
                style="display:inline;fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.75000012;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                ref="radiator" />
            <path ref="wheelaxleFL"
                d="m 91.691145,389.0121 c 0,0 -2.43068,0.29676 -2.43068,-4.28053 0,-4.0406 2.22866,-4.30576 2.22866,-4.30576 9.222155,-0.11908 21.694875,-0.0585 30.917405,-0.0594 3.70837,-9.1e-4 6.85841,-0.28274 8.24298,0.90893 0.51207,0.44072 0.75871,1.92799 1.01166,3.17533 0.35371,1.74427 0.74974,2.96105 0.32477,3.71154 -0.50969,0.90009 -2.57006,0.96141 -2.57006,0.96141 -11.49186,0.003 -26.23329,-0.0229 -37.724735,-0.11152 z"
                style="display:inline;opacity:1;fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
            <path
                style="display:inline;opacity:1;fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                d="m 193.49174,389.0121 c 0,0 2.43068,0.29676 2.43068,-4.28053 0,-4.0406 -2.22865,-4.30576 -2.22865,-4.30576 -9.22216,-0.11908 -21.44488,-0.0585 -30.66742,-0.0594 -3.70837,-9.1e-4 -6.85841,-0.28274 -8.24298,0.90893 -0.51207,0.44072 -0.75871,1.92799 -1.01166,3.17533 -0.35371,1.74427 -0.74974,2.96105 -0.32477,3.71154 0.50969,0.90009 2.57006,0.96141 2.57006,0.96141 11.49186,0.003 25.98329,-0.0229 37.47474,-0.11152 z"
                ref="wheelaxleFR" />
            <path ref="brakeFR"
                d="m 210.35279,373.43366 h -5.22322 l -0.0446,-11.25 c 0,0 -0.0446,-1.02679 -1.51786,-1.16071 -0.91518,-0.15626 -3.83928,-0.067 -3.83928,-0.067 0,0 -2.04238,-0.11866 -2.0759,1.22768 -0.0626,2.51339 -0.0446,47.43304 -0.0446,47.43304 0,0 -0.0431,1.36663 1.7634,1.40625 1.21935,0.0262 3.83928,0.005 3.83928,0.005 0,0 1.86958,0.12132 1.96428,-1.61256 0.073,-1.33729 -0.0207,-10.46221 -0.0207,-10.46221 l 5.24395,-0.12581 z"
                style="display:inline;opacity:1;fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
            <path ref="brakeFL"
                d="m 74.826658,373.43366 h 5.22322 l 0.0446,-11.25 c 0,0 0.0446,-1.02679 1.51786,-1.16071 0.91518,-0.15626 3.83928,-0.067 3.83928,-0.067 0,0 2.04238,-0.11866 2.0759,1.22768 0.0626,2.51339 0.0446,47.43304 0.0446,47.43304 0,0 0.0431,1.36663 -1.7634,1.40625 -1.21935,0.0262 -3.83928,0.005 -3.83928,0.005 0,0 -1.86958,0.12132 -1.96428,-1.61256 -0.073,-1.33729 0.0207,-10.46221 0.0207,-10.46221 l -5.24395,-0.12581 z"
                style="display:inline;opacity:1;fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
            <path
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                d="m 145.98404,268.73244 c 0,0 19.06962,-0.0115 31.7295,1.35397 11.84939,1.27802 23.33457,5.11217 35.69887,11.89174 11.96369,6.55991 22.2596,16.59274 27.50684,31.58729 3.06014,8.74465 3.9025,25.39725 3.9025,25.39725 l -9.60995,-0.14814 c 0,0 -1.63697,-16.52695 -5.20899,-24.93149 -3.97874,-9.3615 -11.63536,-19.52025 -21.21329,-24.53523 -10.62783,-5.56471 -18.68945,-8.01564 -32.75918,-10.2291 -11.61143,-1.82671 -30.13813,-1.14019 -30.13813,-1.14019 z"
                ref="bodyFR" />
            <path
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000012;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                d="m 139.36946,758.05809 c 0,0 -20.14699,0.01 -32.81319,-1.1024 -11.855294,-1.0405 -23.346203,-4.162 -35.716671,-9.6818 -11.969654,-5.3407 -20.679708,-11.5646 -25.929569,-23.7724 -3.061663,-7.1197 -5.495432,-24.34913 -5.495432,-24.34913 l 9.614735,0.12066 c 0,0 1.637794,15.18257 5.211595,22.02527 3.980722,7.6218 11.817934,15.0086 21.40064,19.0916 10.633134,4.5306 18.345219,5.9957 32.421962,7.798 11.61723,1.487 31.39781,0.9282 31.39781,0.9282 z"
                ref="bodyRL" />
            <path ref="bodyRR"
                d="m 145.99795,758.05809 c 0,0 19.59077,0.01 32.25697,-1.1024 11.8553,-1.0405 23.34621,-4.162 35.71668,-9.6818 11.96965,-5.3407 20.67971,-11.5646 25.92957,-23.7724 3.06166,-7.1197 5.49543,-24.34913 5.49543,-24.34913 l -9.61473,0.12066 c 0,0 -1.6378,15.18257 -5.2116,22.02527 -3.98072,7.6218 -11.81793,15.0086 -21.40064,19.0916 -10.63314,4.5306 -18.34522,5.9957 -32.42197,7.798 -11.61723,1.487 -30.84159,0.9282 -30.84159,0.9282 z"
                style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000012;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
            <path
                style="display:inline;opacity:1;fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000012;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                d="m 75.326658,641.12409 h 5.22322 l 0.0446,-11.25 c 0,0 0.0446,-1.02679 1.51786,-1.16071 0.91518,-0.15626 3.83928,-0.067 3.83928,-0.067 0,0 2.04238,-0.11866 2.0759,1.22768 0.0626,2.51339 0.0446,47.43304 0.0446,47.43304 0,0 0.0431,1.36663 -1.7634,1.40625 -1.21935,0.0262 -3.83928,0.005 -3.83928,0.005 0,0 -1.86958,0.12132 -1.96428,-1.61256 -0.073,-1.33729 0.0207,-10.46221 0.0207,-10.46221 l -5.24395,-0.12581 z"
                ref="brakeRL" />
            <path ref="brakeRR"
                d="m 209.87792,642.37917 h -5.22322 l -0.0446,-11.25 c 0,0 -0.0446,-1.02679 -1.51786,-1.16071 -0.91518,-0.15626 -3.83928,-0.067 -3.83928,-0.067 0,0 -2.04238,-0.11866 -2.0759,1.22768 -0.0626,2.51339 -0.0446,47.43304 -0.0446,47.43304 0,0 -0.0431,1.36663 1.7634,1.40625 1.21935,0.0262 3.83928,0.005 3.83928,0.005 0,0 1.86958,0.12132 1.96428,-1.61256 0.073,-1.33729 -0.0207,-10.46221 -0.0207,-10.46221 l 5.24395,-0.12581 z"
                style="display:inline;opacity:1;fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000012;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
            <path
                style="display:inline;opacity:1;fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000012;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                d="m 92.206308,649.46453 c 0,0 -2.43068,-0.29676 -2.43068,4.28053 0,4.0406 2.22866,4.30576 2.22866,4.30576 9.222162,0.11908 21.444882,0.0585 30.667412,0.0594 3.70837,9.1e-4 8.80295,0.28274 10.18752,-0.90893 0.51207,-0.44072 0.6941,-2.38196 0.90117,-3.66147 0.26289,-1.62435 0.42635,-2.41047 0.26953,-3.25855 -0.21138,-1.14316 -2.40433,-0.92826 -2.40433,-0.92826 -12.14004,-6.2e-4 -27.27967,0.0179 -39.419282,0.11152 z"
                ref="wheelaxleRL" />
            <path ref="wheelaxleRR"
                d="m 192.84519,649.46453 c 0,0 2.43068,-0.29676 2.43068,4.28053 0,4.0406 -2.22866,4.30576 -2.22866,4.30576 -9.22216,0.11908 -20.31988,0.0585 -29.54242,0.0594 -3.70837,9.1e-4 -8.80295,0.28274 -10.18752,-0.90893 -0.51207,-0.44072 -0.6941,-2.38196 -0.90117,-3.66147 -0.26289,-1.62435 -0.42635,-2.41047 -0.26953,-3.25855 0.21138,-1.14316 2.40433,-0.92826 2.40433,-0.92826 12.14004,-6.2e-4 26.15468,0.0179 38.29429,0.11152 z"
                style="display:inline;opacity:1;fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000012;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
            <g style="opacity:0" ref="damageContainer">
                <rect
                    style="opacity:0.77399998;fill:#3e3e3e;stroke-width:1.99999893;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;"
                    ref="damageBox" width="206.75557" height="28.991379" x="39.481575" y="234.25491" />
                <path
                    style="opacity:1;fill:none;stroke:#ffffff;stroke-width:1.99999893;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                    d="m 39.48159,263.2463 206.75556,-2e-5" />
                <text y="255.49614" x="142.73175"
                    style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:18.66665649px;line-height:1.25;font-family:roboto;-inkscape-font-specification:roboto;letter-spacing:0px;word-spacing:0px;fill:#ffffff;"
                    xml:space="preserve">
                    <tspan ref="damageText" style="text-align:center;text-anchor:middle;fill:#ffffff;" y="255.49614" x="142.73175">
                        Driveshaft Broken
                    </tspan>
                </text>
            </g>
        </g>
    </svg>
</template>

<script>
const componentDamageMap = {
    body: {
        FL: { svgId: 'bodyFL', priority: 2, tempDamage: false },
        FR: { svgId: 'bodyFR', priority: 2, tempDamage: false },
        ML: { svgId: 'bodyML', priority: 2, tempDamage: false },
        MR: { svgId: 'bodyMR', priority: 2, tempDamage: false },
        RL: { svgId: 'bodyRL', priority: 2, tempDamage: false },
        RR: { svgId: 'bodyRR', priority: 2, tempDamage: false }
    },
    engine: {
        oilStarvation: { svgId: 'engine', priority: 0, damageText: 'Oil Starvation', tempDamage: true },
        coolantHot: { svgId: 'engine', priority: 0, damageText: 'Coolant Overheating', tempDamage: false },
        oilHot: { svgId: 'engine', priority: 0, damageText: 'Oil Overheating', tempDamage: false },
        pistonRingsDamaged: { svgId: 'engine', priority: 0, damageText: 'Piston Rings Damaged', tempDamage: false },
        rodBearingsDamaged: { svgId: 'engine', priority: 0, damageText: 'Rod Bearings Damaged', tempDamage: false },
        headGasketDamaged: { svgId: 'engine', priority: 0, damageText: 'Head Gasket Damaged', tempDamage: false },
        turbochargerHot: { svgId: 'engine', priority: 0, damageText: 'Turbocharger Overheating', tempDamage: false },
        engineIsHydrolocking: { svgId: 'engine', priority: 0, damageText: 'Engine is Hydrolocking', tempDamage: false },
        engineReducedTorque: { svgId: 'engine', priority: 0, damageText: 'Engine Torque Reduced', tempDamage: false },
        mildOverrevDamage: { svgId: 'engine', priority: 0, damageText: 'Mild Over Rev Damage', tempDamage: false },
        overRevDanger: { svgId: 'engine', priority: 0, damageText: 'Over Rev Risk', tempDamage: false },
        overTorqueDanger: { svgId: 'engine', priority: 0, damageText: 'Over Torque Risk', tempDamage: false },
        engineHydrolocked: { svgId: 'engine', priority: 1, damageText: 'Engine is Hydrolocked', tempDamage: false },
        engineDisabled: { svgId: 'engine', priority: 1, damageText: 'Engine Disabled', tempDamage: false },
        blockMelted: { svgId: 'engine', priority: 1, damageText: 'Block Melted', tempDamage: false },
        engineLockedUp: { svgId: 'engine', priority: 1, damageText: 'Engine Locked Up', tempDamage: false },
        radiatorLeak: { svgId: 'radiator', priority: 1, damageText: 'Radiator Leaking', tempDamage: false }
    },
    powertrain: {
        wheelaxleFL: { svgId: 'wheelaxleFL', priority: 1, damageText: 'Front Left Axle Broken', tempDamage: false },
        wheelaxleFR: { svgId: 'wheelaxleFR', priority: 1, damageText: 'Front Right Axle Broken', tempDamage: false },
        wheelaxleRL: { svgId: 'wheelaxleRL', priority: 1, damageText: 'Rear Left Axle Broken', tempDamage: false },
        wheelaxleRR: { svgId: 'wheelaxleRR', priority: 1, damageText: 'Rear Right Axle Broken', tempDamage: false },
        driveshaft: { svgId: 'driveshaft', priority: 1, damageText: 'Driveshaft Broken', tempDamage: false },
        driveshaft_F: { svgId: 'driveshaft', priority: 1, damageText: 'Front Driveshaft Broken', tempDamage: false },
        mainEngine: { svgId: 'engine', priority: 1, damageText: 'Engine Broken', tempDamage: false }
    },
    energyStorage: {
        mainTank: { svgId: 'fueltank', priority: 1, damageText: 'Fuel Tank Damaged', tempDamage: false }
    },
    wheels: {
        tireFL: { svgId: 'tireFL', priority: 0, damageText: 'Front Left Tire Burst', tempDamage: false },
        tireFR: { svgId: 'tireFR', priority: 0, damageText: 'Front Right Tire Burst', tempDamage: false },
        tireRL: { svgId: 'tireRL', priority: 0, damageText: 'Rear Left Tire Burst', tempDamage: false },
        tireRR: { svgId: 'tireRR', priority: 0, damageText: 'Rear Right Tire Burst', tempDamage: false },

        brakeFL: { svgId: 'brakeFL', priority: 1, damageText: 'FL Brake Damaged', tempDamage: false },
        brakeFR: { svgId: 'brakeFR', priority: 1, damageText: 'FR Brake Damaged', tempDamage: false },
        brakeRL: { svgId: 'brakeRL', priority: 1, damageText: 'RL Brake Damaged', tempDamage: false },
        brakeRR: { svgId: 'brakeRR', priority: 1, damageText: 'RR Brake Damaged', tempDamage: false },

        brakeOverHeatFL: { svgId: 'brakeFL', priority: 0, damageText: 'FL Brake Fading', tempDamage: true },
        brakeOverHeatFR: { svgId: 'brakeFR', priority: 0, damageText: 'FR Brake Fading', tempDamage: true },
        brakeOverHeatRL: { svgId: 'brakeRL', priority: 0, damageText: 'RL Brake Fading', tempDamage: true },
        brakeOverHeatRR: { svgId: 'brakeRR', priority: 0, damageText: 'RR Brake Fading', tempDamage: true },

        FL: { svgId: 'tireFL', priority: 1, damageText: 'Front Left Tire Broken', tempDamage: false },
        FR: { svgId: 'tireFR', priority: 1, damageText: 'Front Right Tire Broken', tempDamage: false },
        RL: { svgId: 'tireRL', priority: 1, damageText: 'Rear Left Tire Broken', tempDamage: false },
        RR: { svgId: 'tireRR', priority: 1, damageText: 'Rear Right Tire Broken', tempDamage: false }
    }
}

const textDisplayTime = 2000,
    orangeColor = `rgba(255, 132, 0, 0.6)`,
    redColor = `rgba(255, 0,   0, 0.6)`,
    noDataColor = 'rgba(0,   0,   0, 0  )'

const streamsList = ['wheelThermalData', 'engineInfo']
</script>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useLibStore } from "@/services"

const { $game } = useLibStore()

const svg = ref(null),
    tireFL = ref(null),
    tireFR = ref(null),
    tireRL = ref(null),
    tireRR = ref(null),
    bodyFL = ref(null),
    bodyML = ref(null),
    bodyMR = ref(null),
    driveShaft = ref(null),
    engine = ref(null),
    fueltank = ref(null),
    radiator = ref(null),
    wheelaxleFL = ref(null),
    wheelaxleFR = ref(null),
    brakeFL = ref(null),
    brakeFR = ref(null),
    bodyFR = ref(null),
    bodyRL = ref(null),
    bodyRR = ref(null),
    brakeRL = ref(null),
    brakeRR = ref(null),
    wheelaxleRL = ref(null),
    wheelaxleRR = ref(null),
    damageContainer = ref(null),
    damageBox = ref(null),
    damageText = ref(null)

const appState = reactive({
    isAppDisplayed: false,
    hasDamage: false,
    permanentDamagedParts: 0,
    isProcessingMessages: false
})
const damageTextQueue = ref([])
const componentDamage = ref({
    body: {
        FL: { damageDisplayed: false, reference: bodyFL },
        FR: { damageDisplayed: false, reference: bodyFR },
        ML: { damageDisplayed: false, reference: bodyML },
        MR: { damageDisplayed: false, reference: bodyMR },
        RL: { damageDisplayed: false, reference: bodyRL },
        RR: { damageDisplayed: false, reference: bodyRR }
    },
    engine: {
        oilStarvation: { damageDisplayed: false, reference: engine },
        coolantHot: { damageDisplayed: false, reference: engine },
        oilHot: { damageDisplayed: false, reference: engine },
        pistonRingsDamaged: { damageDisplayed: false, reference: engine },
        rodBearingsDamaged: { damageDisplayed: false, reference: engine },
        headGasketDamaged: { damageDisplayed: false, reference: engine },
        turbochargerHot: { damageDisplayed: false, reference: engine },
        engineIsHydrolocking: { damageDisplayed: false, reference: engine },
        engineReducedTorque: { damageDisplayed: false, reference: engine },
        mildOverrevDamage: { damageDisplayed: false, reference: engine },
        overRevDanger: { damageDisplayed: false, reference: engine },
        overTorqueDanger: { damageDisplayed: false, reference: engine },
        engineHydrolocked: { damageDisplayed: false, reference: engine },
        engineDisabled: { damageDisplayed: false, reference: engine },
        blockMelted: { damageDisplayed: false, reference: engine },
        engineLockedUp: { damageDisplayed: false, reference: engine },
        radiatorLeak: { damageDisplayed: false, reference: radiator }
    },
    powertrain: {
        wheelaxleFL: { damageDisplayed: false, reference: wheelaxleFL },
        wheelaxleFR: { damageDisplayed: false, reference: wheelaxleFR },
        wheelaxleRL: { damageDisplayed: false, reference: wheelaxleRL },
        wheelaxleRR: { damageDisplayed: false, reference: wheelaxleRR },
        driveshaft: { damageDisplayed: false, reference: driveShaft },
        driveshaft_F: { damageDisplayed: false, reference: driveShaft },
        mainEngine: { damageDisplayed: false, reference: engine }
    },
    energyStorage: {
        mainTank: { damageDisplayed: false, reference: fueltank }
    },
    wheels: {
        tireFL: { damageDisplayed: false, reference: tireFL },
        tireFR: { damageDisplayed: false, reference: tireFR },
        tireRL: { damageDisplayed: false, reference: tireRL },
        tireRR: { damageDisplayed: false, reference: tireRR },

        brakeFL: { damageDisplayed: false, reference: brakeFL },
        brakeFR: { damageDisplayed: false, reference: brakeFR },
        brakeRL: { damageDisplayed: false, reference: brakeRL },
        brakeRR: { damageDisplayed: false, reference: brakeRR },

        brakeOverHeatFL: { damageDisplayed: false, reference: brakeFL },
        brakeOverHeatFR: { damageDisplayed: false, reference: brakeFR },
        brakeOverHeatRL: { damageDisplayed: false, reference: brakeRL },
        brakeOverHeatRR: { damageDisplayed: false, reference: brakeRR },

        FL: { damageDisplayed: false, reference: tireFL },
        FR: { damageDisplayed: false, reference: tireFR },
        RL: { damageDisplayed: false, reference: tireRL },
        RR: { damageDisplayed: false, reference: tireRR },
    }
})

const damageTimeout = ref(null)
const animTimeout = ref(null)

onMounted(() => {
    $game.events.on('DamageData', onDamageData)
    $game.events.on('VehicleReset', onReset)
    $game.events.on('VehicleChange', onReset)
    $game.events.on('VehicleFocusChanged', onVehicleFocusChanged)
    $game.streams.add(streamsList)
})

onUnmounted(() => {
    $game.events.off('DamageData', onDamageData)
    $game.events.off('VehicleReset', onReset)
    $game.events.off('VehicleChange', onReset)
    $game.events.off('VehicleFocusChanged', onVehicleFocusChanged)
    $game.streams.remove(streamsList)
})

function onDamageData(data) {
    for (let type in data) {
        for (let component in data[type]) {
            if (componentDamageMap[type] === undefined || componentDamageMap[type][component] === undefined)
                continue

            const damagedComponent = componentDamage.value[type][component]
            const damageComponentProps = componentDamageMap[type][component]

            if (!damagedComponent.damageDisplayed && (data[type][component] === true || data[type][component] > 0)) {
                if (damageComponentProps.priority === 1) {
                    appState.permanentDamagedParts += 1
                    clearTimeout(damageTimeout.value)
                    setComponentDamageStyles(damagedComponent.reference, redColor, 'flashAnim')
                } else if (damageComponentProps.priority === 0) {
                    appState.permanentDamagedParts += 1
                    clearTimeout(damageTimeout.value)
                    setComponentDamageStyles(damagedComponent.reference, orangeColor, 'flashAnim')
                } else if (damageComponentProps.priority === 2) {
                    const damageAmount = Math.round(data[type][component] * 1000)
                    const bodyColor = `rgba(${150 + damageAmount}, ${150 - damageAmount}, 0, 0.6)`
                    setComponentDamageStyles(damagedComponent.reference, bodyColor, '')
                }

                appState.hasDamage = true

                if (damageComponentProps.damageText !== undefined) {
                    damageTextQueue.value.push(damageComponentProps.damageText)
                    damagedComponent.damageDisplayed = true
                }
            } else if (damageComponentProps.tempDamage) {
                if (data[type][component] === true || data[type][component] > 0) {
                    setComponentDamageStyles(damagedComponent.reference, orangeColor, 'flashAnim')
                } else {
                    damagedComponent.damageDisplayed = false
                    appState.permanentDamagedParts = - 1

                    setComponentDamageStyles(damagedComponent.reference, noDataColor, '')
                }
            }
        }
    }

    if (!appState.isAppDisplayed && appState.hasDamage) {
        appState.isAppDisplayed = true

        processDamageText()

        if (appState.permanentDamagedParts === 0) {
            showAppTimed()
        } else {
           clearTimeout(damageTimeout.value)
        }
    }
}

function processDamageText() {
    if (damageTextQueue.value && damageTextQueue.value.length > 0) {
        damageContainer.value.style.opacity = 1
        damageText.value.textContent = damageTextQueue.value[0]

        damageTextQueue.value.splice(0, 1)

        animTimeout.value = setTimeout(processDamageText, textDisplayTime)
    } else {
        damageContainer.value.style.opacity = 0
        damageText.value.textContent = ''

        clearTimeout(animTimeout.value)
    }
}

function onReset() {
    for (let type in componentDamage.value) {
        for (let component in componentDamage.value[type]) {
            componentDamage.value[type][component].reference.style.fill = noDataColor
        }
    }

    appState.isAppDisplayed = false
    appState.hasDamage = false
    appState.permanentDamagedParts = 0
    damageTextQueue.value = []

    showAppTimed()
}

function onVehicleFocusChanged(data) {
    if (data.mode === true)
        onReset()
}

function showAppTimed() {
    if (damageTimeout.value)
        clearTimeout(damageTimeout.value)

    appState.isAppDisplayed = true

    damageTimeout.value = setTimeout(function() { 
        appState.isAppDisplayed = false
    }, 2700)
}

function setComponentDamageStyles(componentRef, color, anim) {
    componentRef.style.fill = color

    if (anim !== '') {
        componentRef.classList.add(anim)
    } else {
        componentRef.classList = []
    }
}
</script>

<style scoped lang="scss">
.svg-app {
    margin: 0;
    padding: 0;
    pointer-events: none;

    .fadeInAnim {
        animation: fadeIn 1s
    }

    .fadeOutAnim {
        animation: fadeOut 1s
    }

    .flashAnim {
        animation: flash 0.4s 5
    }

    .fadeInFadeOutAnim {
        animation: fadeInFadeOut
    }

    @keyframes flash {
        0% {
            fill-opacity: 1;
        }

        50% {
            fill-opacity: 0;
        }

        100% {
            fill-opacity: 1;
        }

    }

    @keyframes fadeInFadeOut {
        0% {
            opacity: 0;
        }

        5% {
            opacity: 1;
        }

        95% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        0% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        0% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }
}
</style>