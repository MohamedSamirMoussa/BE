import { Router } from "express";
import pageContentServices from "./pageContent.service";
import { authentication } from "../../middleware";
export const router: Router = Router({
  mergeParams: true,
  strict: true,
  caseSensitive: true,
});

router.get('/:sectionName' , pageContentServices.get)

router.put(
  "/:sectionName",
  authentication(),
  pageContentServices.update,
);
// router.post('/' , pageContentServices.create)
