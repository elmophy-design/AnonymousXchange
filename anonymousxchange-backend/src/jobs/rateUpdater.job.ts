import { ratesService } from '../services/rates.service'
import { config } from '../config'
import { logger } from '../utils/logger'

export function startRateUpdater() {
	const refresh = async () => {
		try {
      await ratesService.refreshAll()
			logger.info('[rates] refreshed crypto and gift card rates')
		} catch (error) {
			logger.error('[rates] refresh failed', error)
		}
	}

	void refresh()
	return setInterval(() => void refresh(), config.rates.refreshIntervalMs)
}
