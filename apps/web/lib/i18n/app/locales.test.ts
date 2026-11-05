import { describeCatalogParity } from "../catalog-parity";
import { getAppMessages } from "./load";
import { APP_MESSAGES } from "./messages";

describeCatalogParity(APP_MESSAGES, getAppMessages);
