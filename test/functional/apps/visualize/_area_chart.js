import {
  bdd,
  common,
  headerPage,
  scenarioManager,
  settingsPage,
  visualizePage
} from '../../../support';

var expect = require('expect.js');

bdd.describe('visualize app', function describeIndexTests() {
  bdd.before(function () {
    var fromTime = '2015-09-19 06:31:44.000';
    var toTime = '2015-09-23 18:31:44.000';

    common.debug('navigateToApp visualize');
    return common.navigateToApp('visualize')
    .then(function () {
      common.debug('clickAreaChart');
      return visualizePage.clickAreaChart();
    })
    .then(function clickNewSearch() {
      common.debug('clickNewSearch');
      return visualizePage.clickNewSearch();
    })
    .then(function setAbsoluteRange() {
      common.debug('Set absolute time range from \"' + fromTime + '\" to \"' + toTime + '\"');
      return headerPage.setAbsoluteRange(fromTime, toTime);
    })
    .then(function clickBucket() {
      common.debug('Click X-Axis');
      return visualizePage.clickBucket('X-Axis');
    })
    .then(function selectAggregation() {
      common.debug('Click Date Histogram');
      return visualizePage.selectAggregation('Date Histogram');
    })
    .then(function getField() {
      common.debug('Check field value');
      return visualizePage.getField();
    })
    .then(function (fieldValue) {
      common.debug('fieldValue = ' + fieldValue);
      expect(fieldValue).to.be('@timestamp');
    })
    .then(function getInterval() {
      return visualizePage.getInterval();
    })
    .then(function (intervalValue) {
      common.debug('intervalValue = ' + intervalValue);
      expect(intervalValue).to.be('Auto');
    })
    .then(function clickGo() {
      return visualizePage.clickGo();
    })
    .then(function getSpinnerDone() {
      common.debug('Waiting...');
      return headerPage.getSpinnerDone();
    });
  });

  bdd.describe('area charts', function indexPatternCreation() {
    var vizName1 = 'Visualization AreaChart';

    bdd.it('should save and load', function pageHeader() {
      return visualizePage.saveVisualization(vizName1)
      .then(function (message) {
        common.debug('Saved viz message = ' + message);
        common.saveScreenshot('Visualize-area-chart-save-toast');
        expect(message).to.be('Visualization Editor: Saved Visualization \"' + vizName1 + '\"');
      })
      .then(function testVisualizeWaitForToastMessageGone() {
        return visualizePage.waitForToastMessageGone();
      })
      .then(function loadSavedVisualization() {
        return visualizePage.loadSavedVisualization(vizName1);
      })
      .then(function () {
        return visualizePage.waitForVisualization();
      })
      // We have to sleep sometime between loading the saved visTitle
      // and trying to access the chart below with getXAxisLabels
      // otherwise it hangs.
      .then(function sleep() {
        return common.sleep(2000);
      });
    });

    bdd.it('should show correct chart, take screenshot', function pageHeader() {
      var chartHeight = 0;
      var xAxisLabels = [ '2015-09-20 00:00', '2015-09-21 00:00',
        '2015-09-22 00:00', '2015-09-23 00:00'
      ];
      var yAxisLabels = ['0','200','400','600','800','1,000','1,200','1,400','1,600'];
      var expectedAreaChartData = [37, 202, 740, 1437, 1371, 751, 188, 31, 42, 202,
        683, 1361, 1415, 707, 177, 27, 32, 175, 707, 1408, 1355, 726, 201, 29
      ];

      return common.try(function tryingForTime() {
        return visualizePage.getXAxisLabels()
        .then(function compareLabels(labels) {
          common.debug('X-Axis labels = ' + labels);
          expect(labels).to.eql(xAxisLabels);
        });
      })
      .then(function getYAxisLabels() {
        return visualizePage.getYAxisLabels();
      })
      .then(function (labels) {
        common.debug('Y-Axis labels = ' + labels);
        expect(labels).to.eql(yAxisLabels);
      })
      .then(function getAreaChartData() {
        return visualizePage.getAreaChartData('Count');
      })
      .then(function (paths) {
        common.debug('expectedAreaChartData = ' + expectedAreaChartData);
        common.debug('actual chart data =     ' + paths);
        common.saveScreenshot('Visualize-area-chart');
        expect(paths).to.eql(expectedAreaChartData);
      });
    });

    bdd.it('should show correct data', function pageHeader() {
      var expectedTableData = [ 'September 20th 2015, 00:00:00.000 37',
        'September 20th 2015, 03:00:00.000 202',
        'September 20th 2015, 06:00:00.000 740',
        'September 20th 2015, 09:00:00.000 1,437',
        'September 20th 2015, 12:00:00.000 1,371',
        'September 20th 2015, 15:00:00.000 751',
        'September 20th 2015, 18:00:00.000 188',
        'September 20th 2015, 21:00:00.000 31',
        'September 21st 2015, 00:00:00.000 42',
        'September 21st 2015, 03:00:00.000 202',
        'September 21st 2015, 06:00:00.000 683',
        'September 21st 2015, 09:00:00.000 1,361',
        'September 21st 2015, 12:00:00.000 1,415',
        'September 21st 2015, 15:00:00.000 707',
        'September 21st 2015, 18:00:00.000 177',
        'September 21st 2015, 21:00:00.000 27',
        'September 22nd 2015, 00:00:00.000 32',
        'September 22nd 2015, 03:00:00.000 175',
        'September 22nd 2015, 06:00:00.000 707',
        'September 22nd 2015, 09:00:00.000 1,408',
        'September 22nd 2015, 12:00:00.000 1,355',
        'September 22nd 2015, 15:00:00.000 726',
        'September 22nd 2015, 18:00:00.000 201',
        'September 22nd 2015, 21:00:00.000 29'
      ];

      return visualizePage.collapseChart()
      .then(function setPageSize() {
        return settingsPage.setPageSize('All');
      })
      .then(function getDataTableData() {
        return visualizePage.getDataTableData();
      })
      .then(function showData(data) {
        common.debug('getDataTableData = ' + data.split('\n'));
        expect(data.trim().split('\n')).to.eql(expectedTableData);
      });
    });
  });
});