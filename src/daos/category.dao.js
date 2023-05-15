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
const category_schema_1 = require('../models/category.schema');
class CategoryDAO {
	create(dto) {
		return __awaiter(this, void 0, void 0, function* () {
			const createDTO = new category_schema_1.categoryModel(dto);
			return yield createDTO.save();
		});
	}
	getAllCategories() {
		return __awaiter(this, void 0, void 0, function* () {
			return yield category_schema_1.categoryModel
				.find({ delete: false })
				.exec();
		});
	}
	getActiveCategories() {
		return __awaiter(this, void 0, void 0, function* () {
			return yield category_schema_1.categoryModel
				.find({ status: 'Active', delete: false })
				.exec();
		});
	}
	find(filter) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield category_schema_1.categoryModel.find(filter).exec();
		});
	}
	getById(id) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield category_schema_1.categoryModel.findById(id).exec();
		});
	}
	getByName(name) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield category_schema_1.categoryModel
				.findOne({ name: name })
				.exec();
		});
	}
	update(id, dto) {
		return __awaiter(this, void 0, void 0, function* () {
			const updateDTO = yield category_schema_1.categoryModel
				.findById(id)
				.exec();
			Object.assign(updateDTO, dto);
			return yield updateDTO.save();
		});
	}
	delete(id) {
		return __awaiter(this, void 0, void 0, function* () {
			return category_schema_1.categoryModel.findOneAndUpdate(
				{ _id: mongoose_1.default.Types.ObjectId(id) },
				{ delete: true, status: 'Not Active' }
			);
		});
	}
	statusChange(id, params) {
		return __awaiter(this, void 0, void 0, function* () {
			if (params.status === 'Active') {
				return category_schema_1.categoryModel.findOneAndUpdate(
					{ _id: mongoose_1.default.Types.ObjectId(id) },
					{ status: 'Not Active' }
				);
			}
			return category_schema_1.categoryModel.findOneAndUpdate(
				{ _id: mongoose_1.default.Types.ObjectId(id) },
				{ status: 'Active' }
			);
		});
	}
}
exports.default = CategoryDAO;
//# sourceMappingURL=category.dao.js.map
