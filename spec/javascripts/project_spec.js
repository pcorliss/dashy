describe("Project", function() {
  var project,
      project_config = config.projects[0];

  beforeEach(function() {
    loadFixtures('spec/javascripts/fixtures/projects.html');
    project = new Project(project_config);
  });

  describe("#initialize", function() {
    it("initializes a BuildHistorian", function() {
      buildHistorianSpy = spyOn(window, 'BuildHistorian');
      new Project(project_config);
      expect(buildHistorianSpy).toHaveBeenCalledWith('#Sample_Build .frame');
    });

    it("initializes a CurrentBuild", function() {
      currentBuildSpy = spyOn(window, 'CurrentBuild');
      new Project(project_config);
      expect(currentBuildSpy).toHaveBeenCalledWith('#Sample_Build .frame', project_config.name);
    });

    it("initializes a StatusParser", function() {
      statusParserSpy = spyOn(window, 'StatusParser');
      new Project(project_config);
      expect(statusParserSpy).toHaveBeenCalledWith(project_config.ci);
    });
  });

  describe("#buildAndInsertElements", function() {
    beforeEach(function() {
      project.buildAndInsertElements();
    });

    it("inserts a new project html block", function() {
      expect($('.project .frame')).toExist();
    });

    it("inserts an underscore separated project id", function() {
      expect($('#Sample_Build')).toExist();
    });

    describe("building and inserting build historian", function() {
      var buildAndInsertForHistorianSpy;

      beforeEach(function() {
        // TODO: wow, there's alot of spying here...
        var buildHistorian = new BuildHistorian('#project_build');
        buildAndInsertForHistorianSpy = spyOn(buildHistorian, 'buildAndInsertElements');
        spyOn(window, 'BuildHistorian').andReturn(buildHistorian);
        var project = new Project(project_config);
        project.buildAndInsertElements();
      });

      it("builds and inserts the build historian", function() {
        expect(buildAndInsertForHistorianSpy).toHaveBeenCalled();
      });
    });

    describe("building and inserting current build", function() {
      var buildAndInsertForCurrentBuildSpy;

      beforeEach(function() {
        // TODO: wow, there's alot of spying here...
        var currentBuild = new CurrentBuild('#project_build', project_config.name);
        buildAndInsertForCurrentBuildSpy = spyOn(currentBuild, 'buildAndInsertElements');
        spyOn(window, 'CurrentBuild').andReturn(currentBuild);
        var project = new Project(project_config);
        project.buildAndInsertElements();
      });

      it("builds and inserts the current build", function() {
        expect(buildAndInsertForCurrentBuildSpy).toHaveBeenCalled();
      });
    });
  });

  describe("#setStatus", function() {
    beforeEach(function() {
      project.buildAndInsertElements();
    });

    describe("when a new status is set", function() {
      it("blinks a few times", function() {
        var twinkleSpy = spyOn($.fn, 'twinkle');

        project.setStatus('success');
        project.setStatus('building');

        expect(twinkleSpy).toHaveBeenCalled();
      });

      it("ascends to the top", function() {
        var ascendSpy = spyOn($.fn, 'ascend');

        project.setStatus('success');
        project.setStatus('building');

        expect(ascendSpy).toHaveBeenCalled();
      });
    });

    it("calls to setStatus on currentBuild with the new status", function() {
      var setStatusSpy = spyOn(project.currentBuild, 'setStatus');
      project.setStatus('success');
      expect(setStatusSpy).toHaveBeenCalledWith('success');
    });

    it("calls to recordHistory with the current and previous statuses", function() {
      var recordHistorySpy = spyOn(project, 'recordHistory');
      project.setStatus('success');
      project.setStatus('building');
      expect(recordHistorySpy).toHaveBeenCalledWith('success', 'building');
    });
  });

  describe("#playSound", function() {
    it("plays the success sound when the status is 'success' and the previous status was not success", function() {
      var successAudioSpy = spyOn(Audio.success, 'play');
      project.playSound('failure', 'success')

      expect(successAudioSpy).toHaveBeenCalled();
    });

    it("plays the building sound when the status is 'building' and the previous status was not building", function() {
      var buildingAudioSpy = spyOn(Audio.building, 'play');
      project.playSound('success', 'building');
      expect(buildingAudioSpy).toHaveBeenCalled();
    });

    it("plays the failure sound when the status is 'failure' and the previous status was not failure", function() {
      var failureAudioSpy = spyOn(Audio.failure, "play");
      project.playSound('success', 'failure');
      expect(failureAudioSpy).toHaveBeenCalled();
    });
  });

  describe("#recordHistory", function() {
    var buildHistorianSpy;

    beforeEach(function() {
      buildHistorianSpy = spyOn(project.buildHistorian, 'addState');
    });

    it("calls to the build historian when the previous status is success and the new status is not success", function() {
      project.recordHistory('success', 'failure');
      expect(buildHistorianSpy).toHaveBeenCalledWith('success');
    });

    it("calls to the build historian when the previous status is failure and the new status is not failure", function() {
      project.recordHistory('failure', 'success');
      expect(buildHistorianSpy).toHaveBeenCalledWith('failure');
    });
  });

  describe("#update", function() {
    var getSpy;

    beforeEach(function() {
      getSpy = spyOn($, 'get');
    });

    it("makes the request to the project url", function() {
      project.update();
      expect(getSpy.mostRecentCall.args[0]).toEqual(project_config.url);
    });

    it("makes the request using the project format type", function() {
      project.update();
      expect(getSpy.mostRecentCall.args[2]).toEqual(project_config.format);
    });
  });

  describe("#responseHandler", function() {
    var parsedResults = { status:'success', duration:10 },
        setStatusSpy, setDurationSpy;

    beforeEach(function() {
      setStatusSpy = spyOn(project, 'setStatus');
      setDurationSpy = spyOn(project.currentBuild, 'setDuration');
    });

    it("sets the status of the build to the parsed status", function() {
      project.responseHandler(parsedResults);
      expect(setStatusSpy).toHaveBeenCalledWith(parsedResults.status);
    });

    it("calls to current build to set the parsed duration of the build", function() {
      project.responseHandler(parsedResults);
      expect(setDurationSpy).toHaveBeenCalledWith(parsedResults.duration);
    });
  });
});