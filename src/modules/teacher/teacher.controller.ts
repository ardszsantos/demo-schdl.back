import { Controller, Get, Post, Body, Param, Put, Delete} from "@nestjs/common";
import { TeacherService } from "./teacher.service";
import { Public } from "src/common/decorators/public.decorator";

@Controller ("teachers")
export class TeacherController {    

    constructor (private readonly service:TeacherService){}
    
    @Post()
    create (@Body() body: any) {
        return this.service.create(body)
    }

     @Get()
    findAll() {
        return this.service.findAll();
  }

    @Get (':id')
    findONe(@Param('id') id: string){
        return this.service.findOne(id);
    }

    @Put (':id')
    update(@Param('id') id : string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
  }

}