describe("BuildHistorian", function() {
  var buildHistorian;

  beforeEach(function() {
    loadFixtures('spec/javascripts/fixtures/build_history.html');
    buildHistorian = new BuildHistorian('.project');
  });

  describe("#buildAndInsertElements", function() {
    it("inserts a build history list", function() {
      buildHistorian.buildAndInsertElements();
      expect($('.history')).toExist();
    });
  });

  describe("removeOldestBuildResult", function() {
    beforeEach(function() {
      buildHistorian.buildAndInsertElements();
      buildHistorian.addState('success');
    });

    it("drops the oldest build state", function() {
      expect($('.status').length).toEqual(1);
      buildHistorian.removeOldestBuildState();
      expect($('.status').length).toEqual(0);
    });
  });

  describe("#addState", function() {
    beforeEach(function() {
      buildHistorian.buildAndInsertElements();
      buildHistorian.addState('success');
    });

    it("adds the passed state as a class on the state element", function() {
      expect($('.status').hasClass('success')).toBeTruthy();
    });

    it("prepends a new state element", function() {
      expect($('.status').length).toEqual(1)
    });
  });
});