'use strict';
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const mongoose_1 = __importDefault(require('mongoose'));
const deals_schema_1 = require('../models/deals.schema');
class DealsDAO {
	create(dto) {
		return __awaiter(this, void 0, void 0, function* () {
			const createDTO = new deals_schema_1.dealsModel(dto);
			return yield createDTO.save();
		});
	}
	getAllDeals() {
		return __awaiter(this, void 0, void 0, function* () {
			return yield deals_schema_1.dealsModel.find({}).exec();
		});
	}
	getActiveDeals() {
		return __awaiter(this, void 0, void 0, function* () {
			return yield deals_schema_1.dealsModel.find({ status: 'Active' }).exec();
		});
	}
	getById(id) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield deals_schema_1.dealsModel.findById(id).exec();
		});
	}
	getByName(name) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield deals_schema_1.dealsModel.findOne({ name: name }).exec();
		});
	}
	update(id, dto) {
		return __awaiter(this, void 0, void 0, function* () {
			const updateDTO = yield deals_schema_1.dealsModel.findById(id).exec();
			Object.assign(updateDTO, dto);
			return yield updateDTO.save();
		});
	}
	find(filterObj) {
		return __awaiter(this, void 0, void 0, function* () {
			return deals_schema_1.dealsModel.find(filterObj);
		});
	}
	delete(id) {
		return __awaiter(this, void 0, void 0, function* () {
			return deals_schema_1.dealsModel.findOneAndDelete({
				_id: mongoose_1.default.Types.ObjectId(id),
			});
		});
	}
	statusChange(id, params) {
		return __awaiter(this, void 0, void 0, function* () {
			if (params.status === 'Active') {
				return deals_schema_1.dealsModel.findOneAndUpdate(
					{ _id: mongoose_1.default.Types.ObjectId(id) },
					{ status: 'Not Active' }
				);
			}
			return deals_schema_1.dealsModel.findOneAndUpdate(
				{ _id: mongoose_1.default.Types.ObjectId(id) },
				{ status: 'Active' }
			);
		});
	}
}
exports.default = DealsDAO;
//# sourceMappingURL=deals.dao.js.map
