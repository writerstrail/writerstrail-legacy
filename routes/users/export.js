
var router = require('express').Router(),
    models = require('../../models'),
    _ = require('lodash');

// Export all user data as a JSON file.
router.get('/', function (req, res, next) {
    var exported = {
        version: require('../../package.json').version,
    };

    exported.user = {
        name: req.user.name,
        email: req.user.email,
    }

    exported.settings = _.pick(req.user.settings, [
        'dateFormat',
        'timeFormat',
        'lothreshold',
        'hithreshold',
        'showRemaining',
        'showAdjusted',
        'chartType',
        'defaultTimer',
        'performanceMetric',
    ]);

    function getGenres() {
        return models.Genre.findAll({
            where: {
                ownerId: req.user.id
            },
            order: [['name', 'ASC']],
        })
    }

    function processGenres(genres) {
        exported.genres = _.map(genres, function (genre) {
            return _.pick(genre, [
                'id',
                'name',
                'description',
            ]);
        });
    }

    function getProjects() {
        return models.Project.findAll({
            where: {
                ownerId: req.user.id
            },
            order: [['name', 'ASC']],
            include: [
                {
                    model: models.Genre,
                    as: 'genres',
                    order: [['id', 'ASC']],
                },
            ],
        })
    }

    function processProjects(projects) {
        exported.projects = _.map(projects, function (project) {
            var result = _.pick(project, [
                'id',
                'name',
                'description',
                'wordcount',
                'charcount',
                'targetwc',
                'targetcc',
                'correctwc',
                'correctwc',
                'targetunit',
                'active',
                'finished',
                'currentWordcount',
                'currentCharcount',
                'zoneOffset',
                'public',
                'chartOptions',
            ]);
            result.genres = _.map(project.genres, function (genre) {
                return genre.id;
            });
            return result;
        });
    }

    function getTargets() {
        return models.Target.findAll({
            where: {
                ownerId: req.user.id
            },
            order: [['name', 'ASC']],
            include: [
                {
                    model: models.Project,
                    as: 'projects',
                    order: [['id', 'ASC']],
                },
            ],
        });
    }

    function processTargets(targets) {
        exported.targets = _.map(targets, function (target) {
            var result = _.pick(target, [
                'id',
                'name',
                'description',
                'notes',
                'start',
                'end',
                'zoneOffset',
                'count',
                'unit',
                'public',
                'chartOptions',
            ]);
            result.projects = _.map(target.projects, function (project) {
                return project.id;
            });
            return result;
        });
    }

    function getSessions() {
        return models.Session.findAll({
            order: [['start', 'ASC']],
            include: [{
                model: models.Project,
                as: 'project',
                where: {
                    ownerId: req.user.id
                },
                attributes: []
            }],
        });
    }

    function processSessions(sessions) {
        exported.sessions = _.map(sessions, function (session) {
            var result = _.pick(session, [
                'id',
                'summary',
                'start',
                'zoneOffset',
                'duration',
                'pausedTime',
                'wordcount',
                'charcount',
                'isCountdown',
                'notes',
            ]);
            result.project = session.projectId;
            return result;
        });
    }

    // Here to limit the callback hell.
    function handle_data() {
        return getGenres()
            .then(processGenres)
            .then(getProjects)
            .then(processProjects)
            .then(getTargets)
            .then(processTargets)
            .then(getSessions)
            .then(processSessions);
    }

    handle_data().then(function () {
        res.set('Content-Type', 'application/json');
        res.set('Content-Disposition', 'attachment; filename="writerstrail.json"');
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.json(exported)
    }).catch(function (err) {
        next(err);
    });
});

module.exports = router;
