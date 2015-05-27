$.easing.doubleSqrt = function (t, millisecondsSince, startValue, endValue, totalDuration) {
  var res = Math.sqrt(Math.sqrt(t));
  return res;
};

(function ($) {

  $.tileBlockSlider = function (element, options) {

    // 薪邪褋褌褉芯泄泻懈 锌芯 褍屑芯谢褔邪薪懈褞
    var defaults = {
      // 锌械褉懈芯写 褋屑械薪褘 泻邪褉褌懈薪芯泻
      period: 2000,
      // 锌褉芯写芯谢卸懈褌械谢褜薪芯褋褌褜 邪薪懈屑邪褑懈懈
      duration: 1000,
      // 薪邪锌褉邪胁谢械薪懈械 邪薪懈屑邪褑懈懈 (up, down, left, right)
      direction: 'up'
    };
    // 芯斜褗械泻褌 锌谢邪谐懈薪邪
    var plugin = this;
    // 薪邪褋褌褉芯泄泻懈 泻芯薪泻褉械褌薪芯谐芯 芯斜褗械泻褌邪
    plugin.settings = {};

    var $element = $(element), // reference to the jQuery version of DOM element
      element = element;    // reference to the actual DOM element

    var blocks, // 胁褋械 泻邪褉褌懈薪泻懈
      currentBlockIndex, // 懈薪写械泻褋 褌械泻褍褖械谐芯 斜谢芯泻邪
      slideInPosition, // 褋褌邪褉褌芯胁芯械 锌芯谢芯卸械薪懈械 斜谢芯泻邪 锌械褉械写 薪邪褔邪谢芯屑 锌芯褟胁谢械薪懈褟
      slideOutPosition, // 褎懈薪邪谢褜薪芯械 锌芯谢芯卸械薪懈械 斜谢芯泻邪 锌褉懈 褋泻褉褘褌懈懈
      tileWidth, // 褉邪蟹屑械褉褘 锌谢懈褌泻懈
      tileHeight;

    // 懈薪懈褑懈邪谢懈蟹懈褉褍械屑
    plugin.init = function () {

      plugin.settings = $.extend({}, defaults, options);

      // 胁褋械 斜谢芯泻懈
      blocks = $element.children(".tile-content");

      // 械褋谢懈 斜谢芯泻 胁褋械谐芯 1, 褌芯 褋谢邪泄写懈薪谐 薪械 薪褍卸械薪
      if (blocks.length <= 1) {
        return;
      }

      // 懈薪写械泻褋 邪泻褌懈胁薪芯谐芯 胁 写邪薪薪褘泄 屑芯屑械薪褌 斜谢芯泻邪
      currentBlockIndex = 0;

      // 褉邪蟹屑械褉褘 褌械泻褍褖械泄 锌谢懈褌泻懈
      tileWidth = $element.innerWidth();
      tileHeight = $element.innerHeight();
      // 锌芯谢芯卸械薪懈械 斜谢芯泻芯胁
      slideInPosition = getSlideInPosition();
      slideOutPosition = getSlideOutPosition();

      // 锌芯写谐芯褌邪胁谢懈胁邪械屑 斜谢芯泻懈 泻 邪薪懈屑邪褑懈懈
      blocks.each(function (index, block) {
        block = $(block);
        // 斜谢芯泻懈 写芯谢卸薪褘 斜褘褌褜 position:absolute
        // 胁芯蟹屑芯卸薪芯 褝褌芯褌 锌邪褉邪屑械褌褉 蟹邪写邪薪 褔械褉械蟹 泻谢邪褋褋 褋褌懈谢械泄
        // 锌褉芯胁械褉褟械屑, 懈 写芯斜邪胁谢褟械屑 械褋谢懈 褝褌芯 薪械 褌邪泻
        if (block.css('position') !== 'absolute') {
          block.css('position', 'absolute');
        }
        // 褋泻褉褘胁邪械屑 胁褋械 斜谢芯泻懈 泻褉芯屑械 锌械褉胁芯谐芯
        if (index !== 0) {
          block.css('left', tileWidth);
        }
      });

      // 蟹邪锌褍褋泻邪械屑 懈薪褌械褉胁邪谢 写谢褟 褋屑械薪褘 斜谢芯泻芯胁
      setInterval(function () {
        slideBlock();
      }, plugin.settings.period);
    };

    // 褋屑械薪邪 斜谢芯泻芯胁
    var slideBlock = function () {

      var slideOutBlock, // 斜谢芯泻 泻芯褌芯褉褘泄 薪邪写芯 褋泻褉褘褌褜
        slideInBlock, // 斜谢芯泻 泻芯褌芯褉褘泄 薪邪写芯 锌芯泻邪蟹邪褌褜
        mainPosition = {'left': 0, 'top': 0},
        options;

      slideOutBlock = $(blocks[currentBlockIndex]);

      currentBlockIndex++;
      if (currentBlockIndex >= blocks.length) {
        currentBlockIndex = 0;
      }
      slideInBlock = $(blocks[currentBlockIndex]);

      slideInBlock.css(slideInPosition);

      options = {
        duration: plugin.settings.duration,
        easing: 'doubleSqrt'
      };

      slideOutBlock.animate(slideOutPosition, options);
      slideInBlock.animate(mainPosition, options);
    };

    /**
     * 胁芯蟹胁褉邪褖邪械褌 褋褌邪褉褌芯胁褍褞 锌芯蟹懈褑懈褞 写谢褟 斜谢芯泻邪 泻芯褌芯褉褘泄 写芯谢卸械薪 锌芯褟胁懈褌褜褋褟 {left: xxx, top: yyy}
     */
    var getSlideInPosition = function () {
      var pos;
      if (plugin.settings.direction === 'left') {
        pos = {
          'left': tileWidth,
          'top': 0
        }
      } else if (plugin.settings.direction === 'right') {
        pos = {
          'left': -tileWidth,
          'top': 0
        }
      } else if (plugin.settings.direction === 'up') {
        pos = {
          'left': 0,
          'top': tileHeight
        }
      } else if (plugin.settings.direction === 'down') {
        pos = {
          'left': 0,
          'top': -tileHeight
        }
      }
      return pos;
    };

    /**
     * 胁芯蟹胁褉邪褖邪械褌 褎懈薪邪谢褜薪褍褞 锌芯蟹懈褑懈褞 写谢褟 斜谢芯泻邪 泻芯褌芯褉褘泄 写芯谢卸械薪 褋泻褉褘褌褜褋褟 {left: xxx, top: yyy}
     */
    var getSlideOutPosition = function () {
      var pos;
      if (plugin.settings.direction === 'left') {
        pos = {
          'left': -tileWidth,
          'top': 0
        }
      } else if (plugin.settings.direction === 'right') {
        pos = {
          'left': tileWidth,
          'top': 0
        }
      } else if (plugin.settings.direction === 'up') {
        pos = {
          'left': 0,
          'top': -tileHeight
        }
      } else if (plugin.settings.direction === 'down') {
        pos = {
          'left': 0,
          'top': tileHeight
        }
      }
      return pos;
    };

    plugin.getParams = function () {

      // code goes here

    }

    plugin.init();

  }

  $.fn.tileBlockSlider = function (options) {
    return this.each(function () {
      if (undefined == $(this).data('tileBlockSlider')) {
        var plugin = new $.tileBlockSlider(this, options);
        $(this).data('tileBlockSlider', plugin);
      }
    });
  }

})(jQuery);


$(window).ready(function () {
  var slidedTiles = $('[data-role=tile-slider], .block-slider, .tile-slider');
  slidedTiles.each(function (index, tile) {
    var params = {};
    tile = $(tile);
    params.direction = tile.data('paramDirection');
    params.duration = tile.data('paramDuration');
    params.period = tile.data('paramPeriod');
    tile.tileBlockSlider(params);
  })

});