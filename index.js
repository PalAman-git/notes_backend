const app = require('./app'); // the actual Express application
const config = require('./utils/config');
const logger = require('./utils/logger');

// eslint-disable-next-line no-undef
app.listen(config.PORT, () => {
	logger.info(`Server running on port ${config.PORT}`);
});