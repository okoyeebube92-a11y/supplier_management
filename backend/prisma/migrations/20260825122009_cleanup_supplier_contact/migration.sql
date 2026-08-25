-- Preserve existing contact values by renaming the populated column in place.
ALTER TABLE "Supplier" RENAME COLUMN "number" TO "mobileNumber";

-- WeChat contact data is intentionally removed from the Supplier model.
ALTER TABLE "Supplier" DROP COLUMN "wechatId";
